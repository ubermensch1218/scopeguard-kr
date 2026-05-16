#!/usr/bin/env node
/**
 * HWPX 시그니처 검증:
 *  - ZIP 첫 entry가 "mimetype"이고 STORE 압축인지
 *  - 내용이 "application/hwp+zip"인지
 *
 * 이건 한컴오피스가 HWPX를 판별하는 기준임 (ODF/OOXML 동일 규약).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
const outDir = path.join(root, "output_kordoc");

function check(file) {
  const buf = fs.readFileSync(file);
  // ZIP local file header: signature 4B + version 2B + flags 2B + method 2B + ...
  // local header sig = 0x04034b50 (PK\x03\x04)
  if (buf[0] !== 0x50 || buf[1] !== 0x4b || buf[2] !== 0x03 || buf[3] !== 0x04) {
    return { ok: false, reason: "not a ZIP" };
  }
  const method = buf.readUInt16LE(8); // 0 = STORE, 8 = DEFLATE
  const nameLen = buf.readUInt16LE(26);
  const extraLen = buf.readUInt16LE(28);
  const nameStart = 30;
  const name = buf.slice(nameStart, nameStart + nameLen).toString("utf8");
  const dataStart = nameStart + nameLen + extraLen;
  const compressedSize = buf.readUInt32LE(18);
  const content = buf.slice(dataStart, dataStart + compressedSize).toString("utf8");
  return {
    ok: name === "mimetype" && method === 0 && content === "application/hwp+zip",
    name,
    method,
    content: content.slice(0, 50),
  };
}

const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".hwpx"));
const fails = [];
for (const f of files) {
  const r = check(path.join(outDir, f));
  if (!r.ok) fails.push(`${f}: name=${r.name} method=${r.method} content="${r.content}"`);
}
console.log(`signature ok: ${files.length - fails.length}/${files.length}`);
if (fails.length) {
  console.log("FAILS:");
  for (const f of fails) console.log("  " + f);
  process.exit(1);
}
console.log("OK — all files are valid HWPX (mimetype STORE, application/hwp+zip)");
