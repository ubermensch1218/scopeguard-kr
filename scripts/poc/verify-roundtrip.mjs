#!/usr/bin/env node
/**
 * 생성된 .hwpx 파일을 kordoc.parseHwpx로 역파싱해서
 *  - 제목/본문이 보존되는지
 *  - 기대 파일 셋과 디스크 파일이 일치하는지 (missing/unexpected 실패 처리)
 */

import fs from "node:fs";
import path from "node:path";
import { parseHwpx } from "kordoc";
import { loadExpected, diffSets, resolveInputPath, OUTPUT_DIR } from "./_expected.mjs";

const inputPath = resolveInputPath();
const { documents, names: expectedSet } = loadExpected(inputPath);
const expectedTitleByName = new Map(
  documents.map((d) => [d.file.replace(/\.hwp$/i, ".hwpx"), d.title]),
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

let okCount = 0;
const stats = { sizes: [], mdLens: [] };
for (const file of actual) {
  if (!expectedSet.has(file)) continue;
  const buf = fs.readFileSync(path.join(OUTPUT_DIR, file));
  stats.sizes.push(buf.length);
  try {
    const r = await parseHwpx(buf);
    const md = r.markdown || "";
    stats.mdLens.push(md.length);
    const title = expectedTitleByName.get(file) || "";
    if (title && !md.includes(title)) {
      fails.push(`${file}: title "${title}" not found in roundtrip markdown`);
    } else {
      okCount += 1;
    }
  } catch (err) {
    fails.push(`${file}: parseHwpx failed — ${err.message}`);
  }
}

const avg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0);
console.log(`expected: ${expectedSet.size}, verified: ${okCount}/${expectedSet.size}`);
console.log(`avg size: ${avg(stats.sizes)} bytes, avg md: ${avg(stats.mdLens)} chars`);

if (fails.length || okCount !== expectedSet.size) {
  if (okCount !== expectedSet.size && !fails.length) {
    fails.push(`verified ${okCount} but expected ${expectedSet.size}`);
  }
  console.log("FAILS:");
  for (const f of fails) console.log("  " + f);
  process.exit(1);
}
console.log("OK");
