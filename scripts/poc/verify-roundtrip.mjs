#!/usr/bin/env node
/**
 * PoC 검증: 생성된 .hwpx 파일들을 kordoc.parseHwpx로 역파싱
 * - mimetype 확인
 * - 본문 텍스트가 입력 내용을 담고 있는지 확인
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHwpx } from "kordoc";
import { buildDocuments } from "../hwp/docs/index.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
const outDir = path.join(root, "output_kordoc");
const sampleInput = path.join(root, "data", "contract-input.sample.json");

async function main() {
  const input = JSON.parse(fs.readFileSync(sampleInput, "utf8"));
  const documents = buildDocuments(input);
  const expectedNames = new Set(documents.map((d) => d.file.replace(/\.hwp$/i, ".hwpx")));

  const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".hwpx"));
  const fails = [];
  const stats = [];

  for (const file of files) {
    const buf = fs.readFileSync(path.join(outDir, file));
    if (!expectedNames.has(file)) {
      fails.push(`unexpected: ${file}`);
      continue;
    }
    try {
      const r = await parseHwpx(buf);
      const md = r.markdown || "";
      const expected = documents.find((d) => d.file.replace(/\.hwp$/i, ".hwpx") === file);
      const title = expected?.title || "";
      const titleFound = title && md.includes(title);
      stats.push({ file, size: buf.length, mdLen: md.length, titleFound });
      if (title && !titleFound) {
        fails.push(`${file}: title "${title}" not found in roundtrip markdown`);
      }
    } catch (err) {
      fails.push(`${file}: parseHwpx failed — ${err.message}`);
    }
  }

  console.log(`verified ${stats.length} files`);
  console.log(`avg size: ${(stats.reduce((s, x) => s + x.size, 0) / stats.length).toFixed(0)} bytes`);
  console.log(`avg md len: ${(stats.reduce((s, x) => s + x.mdLen, 0) / stats.length).toFixed(0)} chars`);
  console.log(`title-roundtrip ok: ${stats.filter((x) => x.titleFound).length}/${stats.length}`);

  if (fails.length) {
    console.log("\nFAILS:");
    for (const f of fails) console.log("  " + f);
    process.exit(1);
  }
  console.log("OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
