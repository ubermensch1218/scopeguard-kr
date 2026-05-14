import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildDocuments } from "./docx/docs/index.mjs";
import { buildWorkbooks } from "./xlsx/workbooks/index.mjs";
import { writeXlsx } from "./xlsx/writer.mjs";
import { v } from "./docx/helpers.mjs";

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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphXml(text, style = "Normal") {
  const pStyle = style === "Normal" ? "" : `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`;
  return `<w:p>${pStyle}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function cellXml(value, header = false) {
  const shading = header ? '<w:shd w:fill="1F4E79"/>' : "";
  const color = header ? '<w:color w:val="FFFFFF"/>' : '<w:color w:val="222222"/>';
  const boldOpen = header ? "<w:b/>" : "";
  return `<w:tc>
    <w:tcPr>
      <w:tcW w:w="2400" w:type="dxa"/>
      <w:vAlign w:val="top"/>
      ${shading}
    </w:tcPr>
    <w:p>
      <w:pPr><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr>${boldOpen}${color}<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(v(value, ""))}</w:t></w:r>
    </w:p>
  </w:tc>`;
}

function tableXml(block) {
  const headerRow = `<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${block.headers.map((item) => cellXml(item, true)).join("")}</w:tr>`;
  const bodyRows = block.rows
    .map((row) => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${row.map((item) => cellXml(item)).join("")}</w:tr>`)
    .join("");
  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="0" w:type="auto"/>
      <w:tblLook w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:color="B7C2D0"/>
        <w:left w:val="single" w:sz="6" w:color="B7C2D0"/>
        <w:bottom w:val="single" w:sz="6" w:color="B7C2D0"/>
        <w:right w:val="single" w:sz="6" w:color="B7C2D0"/>
        <w:insideH w:val="single" w:sz="4" w:color="D9E2EC"/>
        <w:insideV w:val="single" w:sz="4" w:color="D9E2EC"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="140" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    ${headerRow}${bodyRows}
  </w:tbl><w:p/>`;
}

function blockXml(block) {
  if (block.type === "table") return tableXml(block);
  return paragraphXml(block.text, block.style);
}

function documentXml(doc) {
  const body = [
    paragraphXml(doc.title, "Title"),
    ...doc.blocks.map(blockXml),
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:line="340" w:lineRule="auto" w:after="120"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:color w:val="222222"/><w:sz w:val="20"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:after="280"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="17365D"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="320" w:after="140"/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="D9E2EC"/></w:pBdr></w:pPr>
    <w:rPr><w:b/><w:color w:val="1F4E79"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="25"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Quote">
    <w:name w:val="Quote"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:ind w:left="300"/><w:spacing w:before="80" w:after="180"/><w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="9EB6D8"/></w:pBdr></w:pPr>
    <w:rPr><w:i/><w:color w:val="5C667A"/></w:rPr>
  </w:style>
</w:styles>`;

function writeDocx(doc) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scopeguard-docx-"));
  fs.mkdirSync(path.join(tmp, "_rels"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "word"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "[Content_Types].xml"), contentTypesXml);
  fs.writeFileSync(path.join(tmp, "_rels", ".rels"), rootRelsXml);
  fs.writeFileSync(path.join(tmp, "word", "document.xml"), documentXml(doc));
  fs.writeFileSync(path.join(tmp, "word", "styles.xml"), stylesXml);

  const outPath = path.join(outDir, doc.file);
  execFileSync("zip", ["-qr", outPath, "[Content_Types].xml", "_rels", "word"], { cwd: tmp });
  fs.rmSync(tmp, { recursive: true, force: true });
}

function hwpFileName(docxFile) {
  return docxFile.replace(/\.docx$/u, ".hwp");
}

function normalizeHwpText(value) {
  return v(value, "").replace(/\r?\n/gu, " / ");
}

function writeHwpDocuments(documents) {
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
    execFileSync("cargo", ["run", "--quiet", "--", outDir], {
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
        ${rustString(hwpFileName(doc.file))},
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

function main() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const documents = buildDocuments(input);
  const workbooks = buildWorkbooks(input);
  for (const doc of documents) writeDocx(doc);
  writeHwpDocuments(documents);
  for (const workbook of workbooks) writeXlsx(workbook, outDir);

  const packagePath = path.join(outDir, "scopeguard_sw_contract_docs.zip");
  execFileSync("zip", [
    "-qr",
    packagePath,
    ...documents.map((doc) => doc.file),
    ...documents.map((doc) => hwpFileName(doc.file)),
    ...workbooks.map((workbook) => workbook.file),
  ], { cwd: outDir });

  console.log(`input ${inputPath}`);
  console.log(`created ${documents.length} docx files in ${outDir}`);
  console.log(`created ${documents.length} hwp files in ${outDir}`);
  console.log(`created ${workbooks.length} xlsx files in ${outDir}`);
  console.log(`created ${packagePath}`);
}

main();
