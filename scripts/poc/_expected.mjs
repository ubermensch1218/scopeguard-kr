/**
 * 검증 스크립트 공통 — 기대 파일 셋을 buildDocuments(input)로 만든다.
 *
 * 빈 디렉토리에서 0/0으로 통과되는 false-positive 방지용.
 * 모든 verifier가 이 셋과 디스크의 실제 파일을 대조한다.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocuments } from "../hwp/docs/index.mjs";

const here = fileURLToPath(import.meta.url);
const root = path.resolve(here, "../../..");

export function resolveInputPath(argvInputIdx) {
  const idx = argvInputIdx ?? process.argv.indexOf("--input");
  if (idx >= 0 && process.argv[idx + 1]) return path.resolve(process.argv[idx + 1]);
  const localOverride = path.join(root, "data", "contract-input.json");
  return fs.existsSync(localOverride)
    ? localOverride
    : path.join(root, "data", "contract-input.sample.json");
}

export function loadExpected(inputPath) {
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const documents = buildDocuments(input);
  const names = documents.map((d) => d.file.replace(/\.hwp$/i, ".hwpx"));
  return { input, documents, names: new Set(names), nameList: names };
}

export function diffSets(expectedSet, actualList) {
  const actualSet = new Set(actualList);
  const missing = [...expectedSet].filter((n) => !actualSet.has(n));
  const unexpected = actualList.filter((n) => !expectedSet.has(n));
  return { missing, unexpected };
}

export const OUTPUT_DIR = path.join(root, "output_kordoc");
