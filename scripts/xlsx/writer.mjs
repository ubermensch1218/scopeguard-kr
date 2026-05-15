import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { v } from "../hwp/helpers.mjs";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnName(index) {
  let name = "";
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

function sheetName(name, used) {
  const cleaned = v(name, "Sheet")
    .replace(/[\[\]:*?/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 31) || "Sheet";
  let candidate = cleaned;
  let suffix = 2;
  while (used.has(candidate)) {
    const tail = ` ${suffix}`;
    candidate = `${cleaned.slice(0, 31 - tail.length)}${tail}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function cellXml(value, rowIndex, columnIndex) {
  const ref = `${columnName(columnIndex)}${rowIndex + 1}`;
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(v(value, ""))}</t></is></c>`;
}

function worksheetXml(sheet) {
  const rows = (sheet.rows || []).map((row, rowIndex) => {
    const cells = row.map((cell, columnIndex) => cellXml(cell, rowIndex, columnIndex)).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetData>
    ${rows}
  </sheetData>
</worksheet>`;
}

function workbookXml(sheets) {
  const entries = sheets.map((sheet, index) => (
    `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
  )).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${entries}</sheets>
</workbook>`;
}

function workbookRelsXml(sheets) {
  const entries = sheets.map((_, index) => (
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  )).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${entries}</Relationships>`;
}

function contentTypesXml(sheets) {
  const worksheetOverrides = sheets.map((_, index) => (
    `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  )).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${worksheetOverrides}
</Types>`;
}

const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

export function writeXlsx(workbook, outDir) {
  const used = new Set();
  const sheets = workbook.sheets.map((sheet) => ({
    ...sheet,
    name: sheetName(sheet.name, used),
    rows: sheet.rows?.length ? sheet.rows : [["항목", "내용"], ["확인 필요", ""]],
  }));

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scopeguard-xlsx-"));
  fs.mkdirSync(path.join(tmp, "_rels"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "xl", "_rels"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "xl", "worksheets"), { recursive: true });

  fs.writeFileSync(path.join(tmp, "[Content_Types].xml"), contentTypesXml(sheets));
  fs.writeFileSync(path.join(tmp, "_rels", ".rels"), rootRelsXml);
  fs.writeFileSync(path.join(tmp, "xl", "workbook.xml"), workbookXml(sheets));
  fs.writeFileSync(path.join(tmp, "xl", "_rels", "workbook.xml.rels"), workbookRelsXml(sheets));

  sheets.forEach((sheet, index) => {
    fs.writeFileSync(path.join(tmp, "xl", "worksheets", `sheet${index + 1}.xml`), worksheetXml(sheet));
  });

  const outPath = path.join(outDir, workbook.file);
  execFileSync("zip", ["-qr", outPath, "[Content_Types].xml", "_rels", "xl"], { cwd: tmp });
  fs.rmSync(tmp, { recursive: true, force: true });
}
