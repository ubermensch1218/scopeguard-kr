import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outDir = path.join(root, "output");
const selfPath = path.relative(root, new URL(import.meta.url).pathname);

const join = (...parts) => parts.join("");
const char = (...codes) => String.fromCharCode(...codes);

const blockedDirectTerms = [
  join("두", "들"),
  join("Duu", "dle"),
  join("duu", "dle"),
  join("위", "시", "켓"),
  join("Wish", "ket"),
  join("freelancer", "-legal-", "knowledge"),
  join("outsourcing", "-development"),
  join("blog", ".", "wishket"),
  join("blog", ".", "duu", "dle"),
  join("42", "780"),
];

const blockedPositioningTerms = [
  join("record", "-retention"),
  join("전자", "기록"),
  join("시", "점"),
  join("보관", "동의"),
  join("참조", "근거"),
  join("판", "례"),
  join("정", "부"),
  join("표", "준"),
  join("권", "고"),
  join("N", "L", "I"),
  join("보", "증"),
  join("인", "증"),
  join("공인", "전자", "문서", "센터"),
  join("44", "747"),
];

const blockedPrivateTerms = [
  join("R", "oom"),
  char(0xb8f8),
  join("room", "821"),
  join("js", "kang"),
  join("가", "톨", "릭"),
  join("간", "호"),
  join("E", "N", "R"),
  join("교", "육", "용"),
  join("주식회사 ", char(0xb8f8)),
  join("010", "-"),
  join("주민", "등록"),
  join("계", "좌"),
  join("OPEN", "AI"),
  join("ANTH", "ROPIC"),
  join("CLOUD", "FLARE"),
  join("TO", "KEN"),
  join("SEC", "RET"),
  join("PASS", "WORD"),
];

const sourceBlocklist = [
  ...blockedDirectTerms,
  ...blockedPositioningTerms,
  ...blockedPrivateTerms,
];

const generatedBlocklist = [
  ...blockedDirectTerms,
  ...blockedPositioningTerms,
  ...blockedPrivateTerms,
];

const samples = [
  {
    input: "data/contract-input.sample.json",
    expectedDocx: 18,
    optional: {
      "16_선택별첨_디자인_UX_수정범위.docx": true,
      "17_선택별첨_수정횟수_산정표.docx": true,
    },
  },
  {
    input: "data/contract-input.design.sample.json",
    expectedDocx: 18,
    optional: {
      "16_선택별첨_디자인_UX_수정범위.docx": true,
      "17_선택별첨_수정횟수_산정표.docx": true,
    },
  },
  {
    input: "data/contract-input.ops.sample.json",
    expectedDocx: 16,
    optional: {
      "16_선택별첨_디자인_UX_수정범위.docx": false,
      "17_선택별첨_수정횟수_산정표.docx": false,
    },
  },
];

const keyDocFiles = [
  "02_RFP_과업내용서.docx",
  "03_SW_개발용역계약서_초안.docx",
  "04_검수기준표.docx",
  "10_대금_마일스톤_지급표.docx",
  "15_견적산정표.docx",
];

const syntaxTargets = [
  "assets/app.js",
  "scripts/build-docx-package.mjs",
  "scripts/check-data.mjs",
  "scripts/audit-publish.mjs",
];

const ok = [];
const failures = [];

function pass(message) {
  ok.push(message);
  console.log(`OK ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function assert(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full);
    if (entry.isDirectory()) {
      if ([".git", "node_modules", "output"].includes(entry.name)) continue;
      walk(full, acc);
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

function listDocxScriptTargets() {
  return walk(path.join(root, "scripts", "docx")).filter((file) => file.endsWith(".mjs"));
}

function listJsonTargets() {
  return walk(path.join(root, "data")).filter((file) => file.endsWith(".json"));
}

function listSourceScanTargets() {
  const allowed = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".txt", ".yaml", ".yml", ""]);
  return walk(root).filter((file) => {
    if (file === selfPath) return false;
    if (file.startsWith("output/")) return false;
    if (file.startsWith("node_modules/")) return false;
    if (file.startsWith(".git/")) return false;
    const ext = path.extname(file);
    if (file === ".gitignore" || file === "LICENSE" || file === "CONTRIBUTING.md") return true;
    return allowed.has(ext);
  });
}

function checkSyntax() {
  const targets = [...syntaxTargets, ...listDocxScriptTargets()];
  for (const target of targets) {
    try {
      run("node", ["--check", target]);
      pass(`syntax ${target}`);
    } catch (error) {
      fail(`syntax ${target}: ${error.stderr || error.message}`);
    }
  }
}

function checkJson() {
  for (const target of listJsonTargets()) {
    try {
      JSON.parse(readText(target));
      pass(`json ${target}`);
    } catch (error) {
      fail(`json ${target}: ${error.message}`);
    }
  }
}

function checkRequiredFiles() {
  try {
    run("npm", ["run", "check"]);
    pass("required file list");
  } catch (error) {
    fail(`required file list: ${error.stderr || error.message}`);
  }
}

function checkSourceText() {
  const targets = listSourceScanTargets();
  for (const target of targets) {
    const text = readText(target);
    for (const term of sourceBlocklist) {
      if (text.includes(term)) fail(`blocked source term in ${target}: ${term}`);
    }
  }
  if (!failures.some((item) => item.startsWith("blocked source term"))) {
    pass(`source text scan ${targets.length} files`);
  }
}

function parseInput(samplePath) {
  return JSON.parse(readText(samplePath));
}

function listGeneratedDocx() {
  return fs.readdirSync(outDir).filter((file) => file.endsWith(".docx")).sort();
}

function docxXml(file) {
  return run("unzip", ["-p", path.join(outDir, file), "word/document.xml"]);
}

function packageEntries(packagePath) {
  try {
    return run("unzip", ["-Z1", packagePath]).split(/\r?\n/).filter(Boolean);
  } catch {
    return run("zipinfo", ["-1", packagePath]).split(/\r?\n/).filter(Boolean);
  }
}

function checkGeneratedText(samplePath, docxFiles) {
  const generatedText = docxFiles.map((file) => docxXml(file)).join("\n");
  for (const term of generatedBlocklist) {
    if (generatedText.includes(term)) fail(`blocked generated term for ${samplePath}: ${term}`);
  }
  if (!failures.some((item) => item.includes(`for ${samplePath}`))) {
    pass(`generated text scan ${samplePath}`);
  }
  return generatedText;
}

function checkEstimateIds(samplePath, input, generatedText) {
  const ids = (input.estimate?.rows || []).map((row) => row.id).filter(Boolean);
  for (const id of ids) {
    if (!generatedText.includes(id)) fail(`missing estimate row id ${id} in generated docs for ${samplePath}`);
  }
  for (const file of keyDocFiles) {
    if (!fs.existsSync(path.join(outDir, file))) fail(`missing key doc ${file} for ${samplePath}`);
  }
  if (!failures.some((item) => item.includes(`for ${samplePath}`) && item.includes("estimate row"))) {
    pass(`estimate row links ${samplePath}`);
  }
}

function checkZipAndDocx(samplePath, docxFiles, expectedDocx) {
  assert(docxFiles.length === expectedDocx, `${samplePath} docx count ${docxFiles.length}/${expectedDocx}`);

  for (const file of docxFiles) {
    try {
      run("unzip", ["-tqq", path.join(outDir, file)]);
    } catch (error) {
      fail(`invalid docx ${file} for ${samplePath}: ${error.stderr || error.message}`);
    }
  }
  pass(`docx integrity ${samplePath}`);

  const packagePath = path.join(outDir, "scopeguard_sw_contract_docs.zip");
  try {
    run("unzip", ["-tqq", packagePath]);
    pass(`zip integrity ${samplePath}`);
  } catch (error) {
    fail(`invalid zip for ${samplePath}: ${error.stderr || error.message}`);
  }

  const entries = packageEntries(packagePath).filter((entry) => entry.endsWith(".docx"));
  assert(entries.length === expectedDocx, `${samplePath} zip docx count ${entries.length}/${expectedDocx}`);
}

function checkOptionalDocs(samplePath, docxFiles, optional) {
  for (const [file, expected] of Object.entries(optional)) {
    const exists = docxFiles.includes(file);
    assert(exists === expected, `${samplePath} optional ${file} ${exists ? "present" : "absent"}`);
  }
}

function buildSample(sample) {
  try {
    run("node", ["scripts/build-docx-package.mjs", "--input", sample.input]);
    pass(`build ${sample.input}`);
  } catch (error) {
    fail(`build ${sample.input}: ${error.stderr || error.message}`);
    return;
  }

  const input = parseInput(sample.input);
  const docxFiles = listGeneratedDocx();
  checkZipAndDocx(sample.input, docxFiles, sample.expectedDocx);
  checkOptionalDocs(sample.input, docxFiles, sample.optional);
  const generatedText = checkGeneratedText(sample.input, docxFiles);
  checkEstimateIds(sample.input, input, generatedText);
}

function checkIgnoreBoundary() {
  if (!fs.existsSync(path.join(root, ".git"))) {
    pass("git ignore boundary skipped: repository is not initialized");
    return;
  }

  const targets = [
    "output/scopeguard_sw_contract_docs.zip",
    "data/contract-input.json",
    "data/example.local.json",
    "private/example.md",
    ".env",
    ".codex/sessions/example.log",
  ];

  try {
    run("git", ["check-ignore", "-v", ...targets]);
    pass("git ignore boundary");
  } catch (error) {
    fail(`git ignore boundary: ${error.stderr || error.message}`);
  }
}

function main() {
  checkSyntax();
  checkJson();
  checkRequiredFiles();
  checkSourceText();
  for (const sample of samples) buildSample(sample);
  checkIgnoreBoundary();

  console.log(`\n${ok.length} checks passed`);
  if (failures.length) {
    console.error(`${failures.length} checks failed`);
    process.exit(1);
  }
}

main();
