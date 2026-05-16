#!/usr/bin/env node
/** 가장 단순한 문서 1개 본문을 markdown으로 덤프 — 육안 확인용 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHwpx } from "kordoc";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
const file = process.argv[2] || "00_참고문헌.hwpx";
const buf = fs.readFileSync(path.join(root, "output_kordoc", file));
const r = await parseHwpx(buf);
console.log(r.markdown);
