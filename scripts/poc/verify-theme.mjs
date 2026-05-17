#!/usr/bin/env node
/**
 * 검증: 생성된 .hwpx가 SCOPEGUARD_THEME 색상을 실제로 담고 있고,
 *       표 첫 행이 헤더 charPr를 사용하는지.
 *
 * - 기대 파일 셋(buildDocuments)과 디스크 파일 대조 (missing/unexpected 실패)
 * - 색상 4종이 모두 등장하는지 (파일별)
 * - 표가 있는 문서는 첫 행 셀이 charPrIDRef="9"를 써야 함 (헤더 스타일)
 *   표가 없는 문서는 이 검증 면제
 */

import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { loadExpected, diffSets, resolveInputPath, OUTPUT_DIR } from "./_expected.mjs";

const REQUIRED_COLORS = ["#17365D", "#1F4E79", "#222222", "#5C667A"];

function expectsTable(doc) {
  return (doc.blocks || []).some((b) => b.type === "table");
}

async function check(file, mustUseHeaderStyle) {
  const buf = fs.readFileSync(file);
  const zip = await JSZip.loadAsync(buf);
  const header = await zip.file("Contents/header.xml").async("string");
  const missingColors = REQUIRED_COLORS.filter(
    (c) => !header.includes(`textColor="${c}"`),
  );
  const section = await zip.file("Contents/section0.xml").async("string");
  const usesHeaderCharPr = section.includes('charPrIDRef="9"');
  const headerStyleOk = mustUseHeaderStyle ? usesHeaderCharPr : true;
  return { missingColors, usesHeaderCharPr, headerStyleOk };
}

const inputPath = resolveInputPath();
const { documents, names: expectedSet } = loadExpected(inputPath);
const expectsTableByName = new Map(
  documents.map((d) => [d.file.replace(/\.hwp$/i, ".hwpx"), expectsTable(d)]),
);

if (!fs.existsSync(OUTPUT_DIR)) {
  console.error(`FAIL: ${OUTPUT_DIR} does not exist — run build-kordoc-package.mjs first`);
  process.exit(1);
}

const actual = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".hwpx"));
const { missing, unexpected } = diffSets(expectedSet, actual);

const fails = [];
if (missing.length) fails.push(`missing ${missing.length}: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? " ..." : ""}`);
if (unexpected.length) fails.push(`unexpected ${unexpected.length}: ${unexpected.slice(0, 5).join(", ")}${unexpected.length > 5 ? " ..." : ""}`);

let colorOk = 0;
let headerStyleOk = 0;
let docsWithTable = 0;
for (const f of actual) {
  if (!expectedSet.has(f)) continue;
  const mustUseHeader = !!expectsTableByName.get(f);
  if (mustUseHeader) docsWithTable += 1;
  const r = await check(path.join(OUTPUT_DIR, f), mustUseHeader);
  if (r.missingColors.length) fails.push(`${f}: missing ${r.missingColors.join(",")}`);
  else colorOk += 1;
  if (mustUseHeader && !r.usesHeaderCharPr) {
    fails.push(`${f}: has table but section uses no charPrIDRef="9" — header style not applied`);
  } else if (mustUseHeader) {
    headerStyleOk += 1;
  }
}

console.log(`expected: ${expectedSet.size}, color ok: ${colorOk}/${expectedSet.size}`);
console.log(`docs with table: ${docsWithTable}, header style applied: ${headerStyleOk}/${docsWithTable}`);

if (fails.length || colorOk !== expectedSet.size || headerStyleOk !== docsWithTable) {
  if (!fails.length) {
    if (colorOk !== expectedSet.size) fails.push(`color ${colorOk}/${expectedSet.size}`);
    if (headerStyleOk !== docsWithTable) fails.push(`header style ${headerStyleOk}/${docsWithTable}`);
  }
  console.log("FAILS:");
  for (const x of fails) console.log("  " + x);
  process.exit(1);
}
console.log("OK");
