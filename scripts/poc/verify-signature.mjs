#!/usr/bin/env node
/**
 * HWPX 시그니처 검증:
 *  - ZIP 첫 entry가 "mimetype"이고 STORE 압축인지
 *  - 내용이 "application/hwp+zip"인지
 *
 * + 기대 파일 셋(buildDocuments(input))과 디스크 파일을 대조해
 *   missing/unexpected를 실패 처리. 빈 디렉토리에서 0/0 통과 방지.
 */

import fs from "node:fs";
import path from "node:path";
import { loadExpected, diffSets, resolveInputPath, OUTPUT_DIR } from "./_expected.mjs";

function check(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 30 ||
      buf[0] !== 0x50 || buf[1] !== 0x4b || buf[2] !== 0x03 || buf[3] !== 0x04) {
    return { ok: false, reason: "not a ZIP" };
  }
  const method = buf.readUInt16LE(8);
  const nameLen = buf.readUInt16LE(26);
  const extraLen = buf.readUInt16LE(28);
  const nameStart = 30;
  const name = buf.slice(nameStart, nameStart + nameLen).toString("utf8");
  const dataStart = nameStart + nameLen + extraLen;
  const compressedSize = buf.readUInt32LE(18);
  const content = buf.slice(dataStart, dataStart + compressedSize).toString("utf8");
  return {
    ok: name === "mimetype" && method === 0 && content === "application/hwp+zip",
    name, method, content: content.slice(0, 50),
  };
}

const inputPath = resolveInputPath();
const { names: expectedSet } = loadExpected(inputPath);

if (!fs.existsSync(OUTPUT_DIR)) {
  console.error(`FAIL: ${OUTPUT_DIR} does not exist — run build-kordoc-package.mjs first`);
  process.exit(1);
}

const actual = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".hwpx"));
const { missing, unexpected } = diffSets(expectedSet, actual);

const fails = [];
if (missing.length) fails.push(`missing ${missing.length}: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? " ..." : ""}`);
if (unexpected.length) fails.push(`unexpected ${unexpected.length}: ${unexpected.slice(0, 5).join(", ")}${unexpected.length > 5 ? " ..." : ""}`);

for (const f of actual) {
  if (!expectedSet.has(f)) continue;
  const r = check(path.join(OUTPUT_DIR, f));
  if (!r.ok) fails.push(`${f}: name=${r.name} method=${r.method} content="${r.content}"`);
}

const verified = actual.filter((f) => expectedSet.has(f)).length;
console.log(`expected: ${expectedSet.size}, actual: ${actual.length}, signature ok: ${verified - (fails.filter(x => x.includes(":")).length)}/${expectedSet.size}`);
if (fails.length) {
  console.log("FAILS:");
  for (const f of fails) console.log("  " + f);
  process.exit(1);
}
console.log(`OK — all ${expectedSet.size} expected files present and valid HWPX (mimetype STORE, application/hwp+zip)`);
