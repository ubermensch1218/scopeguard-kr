import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildDocuments } from "./docx/docs/index.mjs";
import { v } from "./docx/helpers.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outDir = path.join(root, "output");
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
  const shading = header ? '<w:shd w:fill="EAF1F8"/>' : "";
  const boldOpen = header ? "<w:b/>" : "";
  return `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/>${shading}</w:tcPr><w:p><w:r><w:rPr>${boldOpen}</w:rPr><w:t xml:space="preserve">${escapeXml(v(value, ""))}</w:t></w:r></w:p></w:tc>`;
}

function tableXml(block) {
  const headerRow = `<w:tr>${block.headers.map((item) => cellXml(item, true)).join("")}</w:tr>`;
  const bodyRows = block.rows
    .map((row) => `<w:tr>${row.map((item) => cellXml(item)).join("")}</w:tr>`)
    .join("");
  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="0" w:type="auto"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:left w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:bottom w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:right w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:insideH w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:insideV w:val="single" w:sz="4" w:color="B7C2D0"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="100" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/>
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
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="20"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:after="280"/></w:pPr>
    <w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="34"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="280" w:after="140"/></w:pPr>
    <w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="25"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Quote">
    <w:name w:val="Quote"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:ind w:left="360"/><w:spacing w:before="80" w:after="160"/></w:pPr>
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

function main() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const documents = buildDocuments(input);
  for (const doc of documents) writeDocx(doc);

  const packagePath = path.join(outDir, "scopeguard_sw_contract_docs.zip");
  execFileSync("zip", ["-qr", packagePath, ...documents.map((doc) => doc.file)], { cwd: outDir });

  console.log(`input ${inputPath}`);
  console.log(`created ${documents.length} docx files in ${outDir}`);
  console.log(`created ${packagePath}`);
}

main();
