import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildDocuments } from "./hwp/docs/index.mjs";
import { buildWorkbooks } from "./xlsx/workbooks/index.mjs";
import { writeXlsx } from "./xlsx/writer.mjs";
import { v } from "./hwp/helpers.mjs";
import { fullArchiveDirName, fullArchiveZipName, phaseBundles } from "./output-bundles.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outDir = path.join(root, "output");
const rhwpRepo = process.env.RHWP_REPO || path.resolve(root, "../rhwp");
const defaultInput = fs.existsSync(path.join(root, "data", "contract-input.json"))
  ? path.join(root, "data", "contract-input.json")
  : path.join(root, "data", "contract-input.sample.json");

const inputPath = (() => {
  const idx = process.argv.indexOf("--input");
  return idx >= 0 ? path.resolve(process.argv[idx + 1]) : defaultInput;
})();

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const fullArchiveDir = path.join(outDir, fullArchiveDirName);

function normalizeHwpText(value) {
  return v(value, "").replace(/\r?\n/gu, " / ");
}

function writeHwpDocuments(documents, outputDir) {
  if (!fs.existsSync(path.join(rhwpRepo, "Cargo.toml"))) {
    throw new Error(`rhwp repository not found: ${rhwpRepo}`);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scopeguard-hwp-docs-"));
  try {
    fs.writeFileSync(
      path.join(tmp, "Cargo.toml"),
      `[package]
name = "scopeguard-hwp-docs"
version = "0.1.0"
edition = "2021"

[dependencies]
rhwp = { path = ${JSON.stringify(rhwpRepo)} }
`,
    );
    fs.mkdirSync(path.join(tmp, "src"));
    fs.writeFileSync(path.join(tmp, "src", "main.rs"), renderHwpRustGenerator(documents));
    execFileSync("cargo", ["run", "--quiet", "--", outputDir], {
      cwd: tmp,
      env: {
        ...process.env,
        CARGO_TARGET_DIR: path.join(os.tmpdir(), "scopeguard-hwp-target"),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function renderHwpRustGenerator(documents) {
  const calls = documents
    .map((doc) => `    write_doc(
        output_dir,
        ${rustString(doc.file)},
        ${rustString(doc.title)},
        &[
${doc.blocks.map(renderHwpBlock).join("\n")}
        ],
    )?;`)
    .join("\n\n");

  return `use std::{env, fs, path::Path};

enum Block<'a> {
    Paragraph { text: &'a str, style: &'a str },
    Table { headers: &'a [&'a str], rows: &'a [&'a [&'a str]] },
}

fn hwp<T>(result: Result<T, rhwp::error::HwpError>) -> Result<T, Box<dyn std::error::Error>> {
    result.map_err(|e| format!("{e}").into())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        eprintln!("usage: scopeguard-hwp-docs <output-dir>");
        std::process::exit(2);
    }
    let output_dir = Path::new(&args[1]);
    fs::create_dir_all(output_dir)?;

${calls}

    Ok(())
}

fn write_doc(
    output_dir: &Path,
    file_name: &str,
    title: &str,
    blocks: &[Block],
) -> Result<(), Box<dyn std::error::Error>> {
    let mut core = rhwp::document_core::DocumentCore::new_empty();
    hwp(core.create_blank_document_native())?;
    hwp(core.begin_batch_native())?;

    let mut para_idx = 0usize;
    insert_paragraph_text(&mut core, &mut para_idx, title, "Title")?;
    for block in blocks {
        match block {
            Block::Paragraph { text, style } => {
                insert_paragraph_text(&mut core, &mut para_idx, text, style)?;
            }
            Block::Table { headers, rows } => {
                insert_table(&mut core, &mut para_idx, headers, rows)?;
            }
        }
    }

    hwp(core.end_batch_native())?;
    let bytes = hwp(core.export_hwp_native())?;
    let reloaded = hwp(rhwp::document_core::DocumentCore::from_bytes(&bytes))?;
    if reloaded.page_count() == 0 {
        return Err(format!("generated HWP has no pages: {file_name}").into());
    }
    fs::write(output_dir.join(file_name), bytes)?;
    Ok(())
}

fn insert_paragraph_text(
    core: &mut rhwp::document_core::DocumentCore,
    para_idx: &mut usize,
    text: &str,
    style: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let lines: Vec<&str> = if text.is_empty() {
        vec![""]
    } else {
        text.lines().collect()
    };

    for (line_idx, line) in lines.iter().enumerate() {
        if *para_idx > 0 || line_idx > 0 {
            hwp(core.insert_paragraph_native(0, *para_idx))?;
        }
        if !line.is_empty() {
            hwp(core.insert_text_native(0, *para_idx, 0, line))?;
        }
        apply_line_style(core, *para_idx, style, line.chars().count())?;
        *para_idx += 1;
    }
    Ok(())
}

fn insert_table(
    core: &mut rhwp::document_core::DocumentCore,
    para_idx: &mut usize,
    headers: &[&str],
    rows: &[&[&str]],
) -> Result<(), Box<dyn std::error::Error>> {
    if *para_idx > 0 {
        hwp(core.insert_paragraph_native(0, *para_idx))?;
    }

    let row_count = rows.len() + 1;
    let col_count = rows
        .iter()
        .map(|row| row.len())
        .chain(std::iter::once(headers.len()))
        .max()
        .unwrap_or(1);
    hwp(core.create_table_native(0, *para_idx, 0, row_count as u16, col_count as u16))?;

    for col_idx in 0..col_count {
        let text = headers.get(col_idx).copied().unwrap_or("");
        insert_cell(core, *para_idx, col_idx, text, true)?;
    }
    for (row_idx, row) in rows.iter().enumerate() {
        for col_idx in 0..col_count {
            let text = row.get(col_idx).copied().unwrap_or("");
            insert_cell(core, *para_idx, (row_idx + 1) * col_count + col_idx, text, false)?;
        }
    }

    *para_idx += 2;
    Ok(())
}

fn insert_cell(
    core: &mut rhwp::document_core::DocumentCore,
    parent_para_idx: usize,
    cell_idx: usize,
    text: &str,
    is_header: bool,
) -> Result<(), Box<dyn std::error::Error>> {
    if text.is_empty() {
        return Ok(());
    }
    hwp(core.insert_text_in_cell_native(0, parent_para_idx, 0, cell_idx, 0, 0, text))?;
    let char_json = if is_header {
        r##"{"fontSize":820,"bold":true,"textColor":"#1F4E79"}"##
    } else {
        r##"{"fontSize":780,"bold":false,"textColor":"#111111"}"##
    };
    hwp(core.apply_char_format_in_cell_native(
        0,
        parent_para_idx,
        0,
        cell_idx,
        0,
        0,
        text.chars().count(),
        char_json,
    ))?;
    hwp(core.apply_para_format_in_cell_native(
        0,
        parent_para_idx,
        0,
        cell_idx,
        0,
        r##"{"alignment":"left","lineSpacing":130,"spacingBefore":0,"spacingAfter":0}"##,
    ))?;
    Ok(())
}

fn apply_line_style(
    core: &mut rhwp::document_core::DocumentCore,
    para_idx: usize,
    style: &str,
    len: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let (char_json, para_json) = match style {
        "Title" => (
            r##"{"fontSize":1700,"bold":true,"textColor":"#17365D"}"##,
            r##"{"alignment":"left","lineSpacing":150,"spacingAfter":1200,"keepWithNext":true}"##,
        ),
        "Heading1" => (
            r##"{"fontSize":1250,"bold":true,"textColor":"#1F4E79"}"##,
            r##"{"alignment":"left","lineSpacing":145,"spacingBefore":900,"spacingAfter":360,"keepWithNext":true}"##,
        ),
        "Quote" => (
            r##"{"fontSize":950,"italic":true,"textColor":"#5C667A"}"##,
            r##"{"alignment":"justify","lineSpacing":140,"marginLeft":500,"spacingBefore":200,"spacingAfter":420}"##,
        ),
        _ => (
            r##"{"fontSize":950,"textColor":"#222222"}"##,
            r##"{"alignment":"justify","lineSpacing":145,"spacingAfter":240}"##,
        ),
    };

    if len > 0 {
        hwp(core.apply_char_format_native(0, para_idx, 0, len, char_json))?;
    }
    hwp(core.apply_para_format_native(0, para_idx, para_json))?;
    Ok(())
}
`;
}

function renderHwpBlock(block) {
  if (block.type === "table") {
    const headers = block.headers.map((cell) => rustString(normalizeHwpText(cell))).join(", ");
    const rows = block.rows
      .map((row) => `&[${row.map((cell) => rustString(normalizeHwpText(cell))).join(", ")}]`)
      .join(",\n            ");
    return `            Block::Table {
                headers: &[${headers}],
                rows: &[
            ${rows}
                ],
            },`;
  }
  return `            Block::Paragraph { text: ${rustString(normalizeHwpText(block.text))}, style: ${rustString(block.style || "Normal")} },`;
}

function rustString(value) {
  return `"${String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\t", "\\t")
    .replaceAll("\n", "\\n")}"`;
}

function writeBundlePackage(sourceDir, bundle) {
  const bundleDir = path.join(outDir, bundle.dirName);
  fs.rmSync(bundleDir, { recursive: true, force: true });
  fs.mkdirSync(bundleDir, { recursive: true });

  const requiredFiles = new Set(bundle.requiredFiles || []);
  const copiedFiles = [];
  for (const file of bundle.files) {
    const source = path.join(sourceDir, file);
    if (!fs.existsSync(source)) {
      if (requiredFiles.has(file)) throw new Error(`phase bundle file missing: ${file}`);
      continue;
    }
    fs.copyFileSync(source, path.join(bundleDir, file));
    copiedFiles.push(file);
  }

  const zipPath = path.join(outDir, bundle.zipName);
  fs.rmSync(zipPath, { force: true });
  execFileSync("zip", ["-qr", zipPath, bundle.dirName], { cwd: outDir });
  return { dirPath: bundleDir, copiedFiles, zipPath };
}

function writeFullArchivePackage() {
  const zipPath = path.join(outDir, fullArchiveZipName);
  fs.rmSync(zipPath, { force: true });
  execFileSync("zip", ["-qr", zipPath, fullArchiveDirName], { cwd: outDir });
  return zipPath;
}

function main() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(fullArchiveDir, { recursive: true });
  const documents = buildDocuments(input);
  const workbooks = buildWorkbooks(input);
  writeHwpDocuments(documents, fullArchiveDir);
  for (const workbook of workbooks) writeXlsx(workbook, fullArchiveDir);
  const bundleResults = phaseBundles.map((bundle) => writeBundlePackage(fullArchiveDir, bundle));
  const packagePath = writeFullArchivePackage();

  console.log(`input ${inputPath}`);
  console.log(`created ${documents.length} hwp files in ${fullArchiveDir}`);
  console.log(`created ${workbooks.length} xlsx files in ${fullArchiveDir}`);
  for (const result of bundleResults) {
    console.log(`created ${result.copiedFiles.length} files in ${result.dirPath}`);
    console.log(`created ${result.zipPath}`);
  }
  console.log(`created ${packagePath}`);
}

main();
