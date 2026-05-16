#!/usr/bin/env node
/**
 * 검증: 생성된 .hwpx 파일들이 SCOPEGUARD_THEME 색상을 실제로 담고 있는지
 * (header.xml 안의 textColor 직접 확인)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
const outDir = path.join(root, "output_kordoc");

const REQUIRED_COLORS = ["#17365D", "#1F4E79", "#222222", "#5C667A"];

async function check(file) {
  const buf = fs.readFileSync(file);
  const zip = await JSZip.loadAsync(buf);
  const header = await zip.file("Contents/header.xml").async("string");
  const missing = REQUIRED_COLORS.filter(
    (c) => !header.includes(`textColor="${c}"`),
  );
  // 첫 행 셀의 charPrIDRef 가 9 인지 (table header style)
  const section = await zip.file("Contents/section0.xml").async("string");
  const usesHeaderCharPr = section.includes('charPrIDRef="9"');
  return { missing, usesHeaderCharPr };
}

const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".hwpx"));
const fails = [];
let withHeaderStyle = 0;
for (const f of files) {
  const r = await check(path.join(outDir, f));
  if (r.missing.length) fails.push(`${f}: missing ${r.missing.join(",")}`);
  if (r.usesHeaderCharPr) withHeaderStyle += 1;
}
console.log(`themed color in header.xml: ${files.length - fails.length}/${files.length}`);
console.log(`table header style applied (section uses charPrIDRef=9): ${withHeaderStyle}/${files.length}`);
if (fails.length) {
  console.log("FAILS:");
  for (const x of fails) console.log("  " + x);
  process.exit(1);
}
console.log("OK");
