#!/usr/bin/env node
/**
 * PoC: rhwp(Rust) 대신 kordoc(npm)으로 HWPX 패키지 생성
 *
 * 기존 build-hwp-package.mjs와 동일한 buildDocuments(input)을 사용.
 * .hwp 출력 대신 .hwpx로 출력. 한컴오피스 동일 호환.
 *
 * 효과: Rust toolchain + rhwp 레포 clone + RHWP_REPO env 불필요.
 *       `npm i kordoc` 한 줄.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocuments } from "../hwp/docs/index.mjs";
import { v } from "../hwp/helpers.mjs";
import { markdownToHwpx } from "kordoc";

// scopeguard rhwp 백엔드와 동일한 색상 팔레트 (시각적 일관성 유지)
const SCOPEGUARD_THEME = {
  headingColors: { 1: "#17365D", 2: "#1F4E79", 3: "#2E74B5" },
  bodyColor: "#222222",
  quoteColor: "#5C667A",
  tableHeaderColor: "#1F4E79",
  tableHeaderBold: true,
};

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
const outDir = path.join(root, "output_kordoc");

const defaultInput = fs.existsSync(path.join(root, "data", "contract-input.json"))
  ? path.join(root, "data", "contract-input.json")
  : path.join(root, "data", "contract-input.sample.json");

const inputPath = (() => {
  const idx = process.argv.indexOf("--input");
  return idx >= 0 ? path.resolve(process.argv[idx + 1]) : defaultInput;
})();

function escapeCell(text) {
  return String(text ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " / ");
}

function blockToMarkdown(block) {
  if (block.type === "p") {
    const text = v(block.text, "");
    const style = block.style || "Normal";
    if (style === "Title" || style === "Heading1") return `# ${text}`;
    if (style === "Heading2") return `## ${text}`;
    if (style === "Heading3") return `### ${text}`;
    if (style === "Quote") return `> ${text}`;
    return text;
  }
  if (block.type === "table") {
    const headers = (block.headers || []).map(escapeCell);
    const rows = (block.rows || []).map((row) => (row || []).map(escapeCell));
    if (!headers.length && !rows.length) return "";
    const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 1);
    const pad = (cells) => {
      const out = cells.slice(0, colCount);
      while (out.length < colCount) out.push("");
      return out;
    };
    const header = headers.length ? pad(headers) : pad(rows[0] || []);
    const dataRows = headers.length ? rows : rows.slice(1);
    const lines = [
      `| ${header.join(" | ")} |`,
      `| ${header.map(() => "---").join(" | ")} |`,
      ...dataRows.map((row) => `| ${pad(row).join(" | ")} |`),
    ];
    return lines.join("\n");
  }
  return "";
}

function documentToMarkdown(doc) {
  const lines = [`# ${doc.title}`, ""];
  for (const block of doc.blocks) {
    const md = blockToMarkdown(block);
    if (md) lines.push(md, "");
  }
  return lines.join("\n");
}

async function writeKordocDocuments(documents, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  let okCount = 0;
  for (const doc of documents) {
    const md = documentToMarkdown(doc);
    const buf = await markdownToHwpx(md, { theme: SCOPEGUARD_THEME });
    const filename = doc.file.replace(/\.hwp$/i, ".hwpx");
    fs.writeFileSync(path.join(outputDir, filename), Buffer.from(buf));
    okCount += 1;
  }
  return okCount;
}

async function main() {
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const documents = buildDocuments(input);
  const startedAt = Date.now();
  const okCount = await writeKordocDocuments(documents, outDir);
  const elapsedMs = Date.now() - startedAt;

  console.log(`input ${inputPath}`);
  console.log(`created ${okCount} hwpx files in ${outDir} (${elapsedMs}ms)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
