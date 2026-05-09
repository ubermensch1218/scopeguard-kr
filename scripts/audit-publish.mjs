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
    expectedDocx: 19,
    expectedXlsx: 16,
    optional: {
      "16_선택별첨_디자인_UX_수정범위.docx": true,
      "17_선택별첨_수정횟수_산정표.docx": true,
    },
    optionalXlsx: {
      "16_선택별첨_디자인_UX_수정범위.xlsx": true,
      "17_선택별첨_수정횟수_산정표.xlsx": true,
    },
  },
  {
    input: "data/contract-input.design.sample.json",
    expectedDocx: 19,
    expectedXlsx: 16,
    optional: {
      "16_선택별첨_디자인_UX_수정범위.docx": true,
      "17_선택별첨_수정횟수_산정표.docx": true,
    },
    optionalXlsx: {
      "16_선택별첨_디자인_UX_수정범위.xlsx": true,
      "17_선택별첨_수정횟수_산정표.xlsx": true,
    },
  },
  {
    input: "data/contract-input.ops.sample.json",
    expectedDocx: 17,
    expectedXlsx: 14,
    optional: {
      "16_선택별첨_디자인_UX_수정범위.docx": false,
      "17_선택별첨_수정횟수_산정표.docx": false,
    },
    optionalXlsx: {
      "16_선택별첨_디자인_UX_수정범위.xlsx": false,
      "17_선택별첨_수정횟수_산정표.xlsx": false,
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

const generatedContentRequirements = [
  ["00_참고문헌.docx", ["계약 조항의 판단이나 법률 의견이 아닙니다"]],
  ["01_입력값_요약표.docx", ["핵심 운영 조건", "견적 row 수"]],
  ["02_RFP_과업내용서.docx", ["견적 row 기반 작업 범위", "착수 자료"]],
  ["03_SW_개발용역계약서_초안.docx", ["개발 착수 조건", "제7조 변경요청", "제10조 분쟁 축소 절차"]],
  ["04_검수기준표.docx", ["견적 row 테스트 조건", "검수 절차"]],
  ["05_수정요청서.docx", ["대상 화면/기능", "분류", "수정 회차", "수정 요청 항목", "분류 기준", "처리 결과"]],
  ["06_변경요청서.docx", ["기준 견적 row", "변경 대상 요구사항 ID", "착수 조건", "변경 사유/분류", "영향 분석", "승인 전 착수 금지"]],
  ["07_회의록_승인서.docx", ["결정 사항", "보류 사항", "승인 기준", "회의 비용/횟수 기준", "구두 요청 효력", "액션 아이템"]],
  ["08_납품확인서.docx", ["확인 구분", "단순 납품 수령 확인", "검수 완료 및 승인 확인", "납품 범위", "산출물 인도 목록", "검수 및 대금", "잔금 지급 조건", "미비 항목 및 보완 기한", "하자·무상수정·변경요청 구분", "권리/계정 인수 확인", "검수 합격 또는 하자 없음"]],
  ["09_하자신고서.docx", ["재현 절차", "기대 결과", "실제 결과", "하자 성립 체크", "처리 기준", "무상수정 회차 차감 여부"]],
  ["10_대금_마일스톤_지급표.docx", ["마일스톤", "견적 row 금액"]],
  ["11_권리귀속_소스코드_인도목록.docx", ["프로젝트 전용 산출물", "수급자 사전보유자산"]],
  ["12_운영비_API_계정_인수인계서.docx", ["운영 비용", "계정 인수인계"]],
  ["13_개인정보_보안_요구사항.docx", ["개인정보 처리 여부", "접근통제"]],
  ["14_공급자_수요자_합의표.docx", ["수요자 이점", "공급자 이점", "균형안"]],
  ["15_견적산정표.docx", ["견적 row", "변경요청 단가", "전제조건"]],
  ["16_선택별첨_디자인_UX_수정범위.docx", ["사례별 분류표", "입력해야 할 기준"]],
  ["17_선택별첨_수정횟수_산정표.docx", ["수정 1회", "산정표"]],
  ["18_기능별_구현_디자인_명세서.docx", ["진입점", "디자인 요건 충족 여부", "디자인 플로우", "Mermaid", "최종 화면", "최종 결과", "화면/결과 검수 연결"]],
];

const generatedWorkbookRequirements = [
  ["01_입력값_요약표.xlsx", ["핵심 운영 조건", "견적 row 수"]],
  ["04_검수기준표.xlsx", ["견적 row 테스트 조건", "검수 기준"]],
  ["05_수정요청서.xlsx", ["수정 요청 항목", "수정횟수 산정 기준"]],
  ["06_변경요청서.xlsx", ["변경 요청", "기준 견적 row"]],
  ["07_회의록_승인서.xlsx", ["회의 정보", "결정 사항", "구두 요청 효력"]],
  ["08_납품확인서.xlsx", ["납품 범위", "산출물 인도 목록"]],
  ["09_하자신고서.xlsx", ["하자 신고", "하자 성립 체크"]],
  ["10_대금_마일스톤_지급표.xlsx", ["마일스톤", "견적 row 금액"]],
  ["14_공급자_수요자_합의표.xlsx", ["수요자 이점", "공급자 이점", "균형안"]],
  ["15_견적산정표.xlsx", ["견적 row", "변경요청 단가"]],
  ["16_선택별첨_디자인_UX_수정범위.xlsx", ["사례별 분류표", "입력해야 할 기준"]],
  ["17_선택별첨_수정횟수_산정표.xlsx", ["수정 1회", "산정표"]],
  ["18_기능별_구현_디자인_명세서.xlsx", ["진입점", "디자인 요건", "Mermaid 원문", "최종 결과"]],
  ["19_착수자료_확정표.xlsx", ["착수자료 확정", "기능별 착수 조건", "미제공 영향"]],
  ["20_검수실행_기록표.xlsx", ["검수 실행", "반려 재검수", "증거 링크"]],
  ["21_계약서_리스크_검토표.xlsx", ["리스크 검토", "누락 조항", "추천 보완"]],
];

const documentModuleSlugs = [
  "00-reference",
  "01-input-summary",
  "02-rfp-spec",
  "03-contract-draft",
  "04-acceptance-criteria",
  "05-revision-request",
  "06-change-request",
  "07-meeting-minutes",
  "08-delivery-confirmation",
  "09-defect-report",
  "10-payment-schedule",
  "11-rights-handover",
  "12-ops-handover",
  "13-privacy-security",
  "14-agreement-options",
  "15-estimate-sheet",
  "16-design-ux-appendix",
  "17-revision-counting",
  "18-feature-design-spec",
  "19-start-material-confirmation",
  "20-acceptance-run-log",
  "21-contract-risk-review",
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
      if ([".git", "node_modules", "output", "tmp", "private", ".private", "local"].includes(entry.name)) continue;
      if (["data/uploads", "data/raw"].includes(rel)) continue;
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

function listXlsxScriptTargets() {
  return fs.existsSync(path.join(root, "scripts", "xlsx"))
    ? walk(path.join(root, "scripts", "xlsx")).filter((file) => file.endsWith(".mjs"))
    : [];
}

function listJsonTargets() {
  return walk(path.join(root, "data")).filter((file) => {
    if (!file.endsWith(".json")) return false;
    if (file.endsWith(".local.json") || file.endsWith(".private.json")) return false;
    return true;
  });
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
  const targets = [...syntaxTargets, ...listDocxScriptTargets(), ...listXlsxScriptTargets()];
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

function checkSkillProof() {
  const expectations = [
    [".codex/skills/sw-contract-scopeguard/SKILL.md", ["orchestrator", "DOCX/XLSX", "references/documents/index.md", "입증"]],
    [".claude/skills/sw-contract-scopeguard/SKILL.md", ["orchestrator", "DOCX/XLSX", "references/documents/index.md", "입증"]],
    [".codex/skills/sw-contract-scopeguard/references/document-writing-recipes.md", ["DOCX/XLSX", "입증 기준", "21 | 계약서 리스크 검토표"]],
    [".claude/skills/sw-contract-scopeguard/references/document-writing-recipes.md", ["DOCX/XLSX", "입증 기준", "21 | 계약서 리스크 검토표"]],
    [".codex/skills/sw-contract-scopeguard/references/documents/index.md", ["Document Modules", "orchestrator skill", "21-contract-risk-review"]],
    [".claude/skills/sw-contract-scopeguard/references/documents/index.md", ["Document Modules", "orchestrator skill", "21-contract-risk-review"]],
    ["docs/skill-proof.md", ["DOCX 생성", "XLSX 생성", "양식 필수 내용"]],
  ];
  for (const [target, terms] of expectations) {
    const text = readText(target);
    for (const term of terms) {
      if (!text.includes(term)) fail(`skill proof missing ${term} in ${target}`);
    }
  }
  if (!failures.some((item) => item.startsWith("skill proof missing"))) {
    pass("skill proof files");
  }
}

function checkDocumentModules() {
  for (const base of [".codex", ".claude"]) {
    for (const slug of documentModuleSlugs) {
      const target = `${base}/skills/sw-contract-scopeguard/references/documents/${slug}/recipe.md`;
      if (!fs.existsSync(path.join(root, target))) {
        fail(`missing document module ${target}`);
        continue;
      }
      const text = readText(target);
      for (const term of ["Format:", "Inputs:", "Output:", "Must include:", "Use when:"]) {
        if (!text.includes(term)) fail(`document module ${target} missing ${term}`);
      }
    }
  }
  if (!failures.some((item) => item.startsWith("missing document module") || item.startsWith("document module"))) {
    pass("document recipe modules");
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

function listGeneratedXlsx() {
  return fs.readdirSync(outDir).filter((file) => file.endsWith(".xlsx")).sort();
}

function docxXml(file) {
  return run("unzip", ["-p", path.join(outDir, file), "word/document.xml"]);
}

function xlsxXml(file) {
  const archive = path.join(outDir, file);
  const entries = packageEntries(archive).filter((entry) => (
    entry === "xl/workbook.xml" || entry.startsWith("xl/worksheets/")
  ));
  return entries.map((entry) => run("unzip", ["-p", archive, entry])).join("\n");
}

function packageEntries(packagePath) {
  try {
    return run("unzip", ["-Z1", packagePath]).split(/\r?\n/).filter(Boolean);
  } catch {
    return run("zipinfo", ["-1", packagePath]).split(/\r?\n/).filter(Boolean);
  }
}

function checkGeneratedText(samplePath, docxFiles, xlsxFiles) {
  const generatedText = [
    ...docxFiles.map((file) => docxXml(file)),
    ...xlsxFiles.map((file) => xlsxXml(file)),
  ].join("\n");
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

function checkGeneratedContentRequirements(samplePath, docxFiles) {
  for (const [file, terms] of generatedContentRequirements) {
    if (!docxFiles.includes(file)) continue;
    const xml = docxXml(file);
    for (const term of terms) {
      if (!xml.includes(term)) fail(`missing required content in ${file} for ${samplePath}: ${term}`);
    }
  }
  if (!failures.some((item) => item.includes(`for ${samplePath}`) && item.includes("missing required content"))) {
    pass(`generated content requirements ${samplePath}`);
  }
}

function checkGeneratedWorkbookRequirements(samplePath, xlsxFiles) {
  for (const [file, terms] of generatedWorkbookRequirements) {
    if (!xlsxFiles.includes(file)) continue;
    const xml = xlsxXml(file);
    for (const term of terms) {
      if (!xml.includes(term)) fail(`missing required content in ${file} for ${samplePath}: ${term}`);
    }
  }
  if (!failures.some((item) => item.includes(`for ${samplePath}`) && item.includes("missing required content"))) {
    pass(`generated workbook requirements ${samplePath}`);
  }
}

function checkZipAndFiles(samplePath, docxFiles, xlsxFiles, expectedDocx, expectedXlsx) {
  assert(docxFiles.length === expectedDocx, `${samplePath} docx count ${docxFiles.length}/${expectedDocx}`);
  assert(xlsxFiles.length === expectedXlsx, `${samplePath} xlsx count ${xlsxFiles.length}/${expectedXlsx}`);

  for (const file of docxFiles) {
    try {
      run("unzip", ["-tqq", path.join(outDir, file)]);
    } catch (error) {
      fail(`invalid docx ${file} for ${samplePath}: ${error.stderr || error.message}`);
    }
  }
  pass(`docx integrity ${samplePath}`);

  for (const file of xlsxFiles) {
    try {
      run("unzip", ["-tqq", path.join(outDir, file)]);
    } catch (error) {
      fail(`invalid xlsx ${file} for ${samplePath}: ${error.stderr || error.message}`);
    }
  }
  pass(`xlsx integrity ${samplePath}`);

  const packagePath = path.join(outDir, "scopeguard_sw_contract_docs.zip");
  try {
    run("unzip", ["-tqq", packagePath]);
    pass(`zip integrity ${samplePath}`);
  } catch (error) {
    fail(`invalid zip for ${samplePath}: ${error.stderr || error.message}`);
  }

  const entries = packageEntries(packagePath).filter((entry) => entry.endsWith(".docx"));
  assert(entries.length === expectedDocx, `${samplePath} zip docx count ${entries.length}/${expectedDocx}`);
  const workbookEntries = packageEntries(packagePath).filter((entry) => entry.endsWith(".xlsx"));
  assert(workbookEntries.length === expectedXlsx, `${samplePath} zip xlsx count ${workbookEntries.length}/${expectedXlsx}`);
}

function checkOptionalDocs(samplePath, files, optional) {
  for (const [file, expected] of Object.entries(optional)) {
    const exists = files.includes(file);
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
  const xlsxFiles = listGeneratedXlsx();
  checkZipAndFiles(sample.input, docxFiles, xlsxFiles, sample.expectedDocx, sample.expectedXlsx);
  checkOptionalDocs(sample.input, docxFiles, sample.optional);
  checkOptionalDocs(sample.input, xlsxFiles, sample.optionalXlsx);
  const generatedText = checkGeneratedText(sample.input, docxFiles, xlsxFiles);
  checkEstimateIds(sample.input, input, generatedText);
  checkGeneratedContentRequirements(sample.input, docxFiles);
  checkGeneratedWorkbookRequirements(sample.input, xlsxFiles);
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
  checkSkillProof();
  checkDocumentModules();
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
