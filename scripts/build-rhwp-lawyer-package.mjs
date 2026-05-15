#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFile, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "output");
const rhwpRepo = process.env.RHWP_REPO || path.resolve(repoRoot, "../rhwp");
const generatedAt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const sourceMd = path.join(outputDir, "변호사_검토_요청서_정리본.md");
const outputHwp = path.join(outputDir, "변호사_검토_요청서_정리본.hwp");
const outputZip = path.join(outputDir, "scopeguard_lawyer_review_rhwp_package.zip");
const riskWorkbook = path.join(outputDir, "21_계약서_리스크_검토표.xlsx");

const docLines = [
  line("title", "변호사 검토 요청서"),
  line("subtitle", "SW 외주개발계약 체결 전 리스크 정리본"),
  line("meta", `작성 기준일: ${generatedAt}`),
  line("meta", "목적: 소송 가능성 예측이 아니라, 체결 전에 조항의 모호함과 과도한 책임을 줄이는 것입니다."),
  line("spacer", ""),

  line("h1", "1. 먼저 검토해 주실 문서"),
  line("body", "아래 문서는 분쟁이 발생했을 때 금액, 권리, 운영 책임으로 바로 이어질 가능성이 높아 우선 검토 대상입니다."),
  bullet("SW 개발용역계약서 초안: 과업 범위, 검수, 승인간주, 대금 지급, 지체상금, 손해배상 한도, 해지 사유"),
  bullet("RFP/과업내용서 및 견적산정표: 요구사항 ID, 견적 row, 전제조건, 완료 조건, 테스트 조건 연결"),
  bullet("검수기준표와 검수실행 기록표: 반려 사유, 증빙 방식, 미응답 승인 처리, 잔금 지급 조건"),
  bullet("수정요청서, 변경요청서, 하자신고서: 무상수정, 하자보수, 유상 변경요청의 경계"),
  bullet("권리귀속/소스코드 인도목록: 전용 산출물, 사전보유자산, 오픈소스, 외부 API, 포트폴리오 사용"),
  bullet("개인정보/보안 요구사항: 처리위탁, 재위탁, 접근권한, 보관기간, 삭제/반환, 침해 통지"),
  bullet("NDA/IP 쟁점: 비밀정보 범위, 사용목적 제한, 잔존지식, 피드백 권리, 공동개발 결과물 귀속"),
  table([
    ["우선", "자료", "검토 포인트"],
    ["P0", "용역계약서", "검수/변경/대금/배상"],
    ["P0", "권리귀속표", "산출물/IP/오픈소스"],
    ["P0", "NDA/IP", "비밀정보/잔존지식/피드백"],
    ["P0", "개인정보/보안", "위탁/접근/삭제/침해"],
  ]),
  line("spacer", ""),

  line("h1", "2. 분쟁이 더 생기기 쉬운 구석"),
  risk("검수 기준 부재: 납품 후 완료, 하자, 취향 변경, 신규 기능 요구가 섞이면 잔금과 하자보수가 동시에 막힙니다."),
  risk("수정과 변경요청 혼재: 문구 수정, 디자인 선호 변경, 신규 화면, 데이터 구조 변경을 한 요청서로 받으면 무상/유상 경계가 흐려집니다."),
  risk("구두 요청과 회의록 부재: 회의 중 발언이 계약 범위처럼 주장될 수 있으므로 승인된 회의록과 변경요청 절차가 필요합니다."),
  risk("착수자료 미확정: PRD, 기능정의서, 화면설계서, 데이터, 검수 기준이 비어 있으면 일정 지연과 범위 변경이 같이 발생합니다."),
  risk("권리귀속과 NDA 경계: 소스코드, 템플릿, 데이터셋, 미공개 제품정보, 피드백, 공동개발 결과물의 사용 범위가 뒤늦게 문제 됩니다."),
  risk("운영비와 계정 인수: API, 모델, 도메인, 문자, 클라우드, 관리자 계정 비용과 장애 책임이 납품 뒤에도 남습니다."),
  risk("개인정보와 고객 데이터 접근: 개발 중 접근권한, 로그, 테스트 데이터, 삭제/반환 책임이 문서화되지 않으면 사고 대응이 어렵습니다."),
  risk("대금과 마일스톤 연결 끊김: 산출물, 검수, 세금계산서, 잔금 지급 조건이 서로 다른 기준으로 움직일 수 있습니다."),
  table([
    ["분쟁 지점", "왜 커지는가", "잠그는 자료"],
    ["검수", "완료/하자/선호 변경 혼재", "검수기준표"],
    ["수정/변경", "무상/유상 경계 다툼", "수정/변경요청서"],
    ["구두 요청", "발언이 범위처럼 주장됨", "승인 회의록"],
    ["권리/NDA", "IP/피드백 귀속 흔들림", "권리귀속표"],
  ]),
  line("spacer", ""),

  line("h1", "3. 변호사에게 확인받고 싶은 질문"),
  line("h2", "계약 운영"),
  bullet("대금, 검수, 해지, 지체상금, 손해배상 한도가 한쪽에 과도하게 불리하지 않은지 봐주세요."),
  bullet("하자, 경미한 수정, 선호 변경, 신규 기능을 조항과 별첨에서 충분히 분리했는지 봐주세요."),
  bullet("검수 기한, 반려 방식, 미응답 승인간주, 잔금 지급 트리거가 실무적으로 작동하는지 봐주세요."),
  bullet("회의록 승인 전 구두 발언의 효력을 제한할 수 있는지 봐주세요."),
  line("h2", "권리와 보안"),
  bullet("소스코드, 산출물, 사전보유자산, 오픈소스, 외부 API의 권리귀속 표현이 충분한지 봐주세요."),
  bullet("개인정보 처리위탁, 재위탁, 접근권한, 삭제/반환, 침해 통지 책임을 별첨으로 충분히 나눴는지 봐주세요."),
  bullet("NDA의 비밀정보 범위, 목적 외 사용 금지, 반환/삭제, 잔존지식, 피드백 권리 조항이 과하거나 비어 있지 않은지 봐주세요."),
  line("spacer", ""),

  line("h1", "4. NDA/IP 집중 검토 항목"),
  bullet("비밀정보 범위: 미팅 메모, 화면공유, 저장소, 데이터셋, 고객명단, 가격표, 미공개 제품자료가 포함되는지"),
  bullet("예외 정보: 이미 알고 있던 정보, 공개 정보, 독자 개발 결과를 어떻게 제외할지"),
  bullet("사용목적 제한: 견적, 검토, PoC, 투자검토 외 다른 목적으로 쓰지 못하게 막을 수 있는지"),
  bullet("접근자 범위: 임직원, 외주 인력, 계열사, 자문사에게 어디까지 공유할 수 있는지"),
  bullet("복제/반환/삭제: 사본, 백업, 캡처, 파생 파일을 종료 후 어떻게 처리할지"),
  bullet("잔존지식: 사람이 기억한 아이디어나 노하우를 어디까지 사용할 수 있게 둘지"),
  bullet("피드백 권리: 상대방의 개선 제안, 아이디어, 버그 리포트를 제품에 반영할 수 있는지"),
  bullet("공동개발 결과물: 같이 만든 코드, 화면, 데이터 구조, 모델 튜닝 결과의 귀속과 사용 범위"),
  line("spacer", ""),

  line("h1", "5. 첨부할 자료"),
  bullet("계약 원문: 상대방 계약서, 우리 수정안, 별첨, 약관 링크"),
  bullet("과업 범위: 제안서, 견적서, RFP, 기능정의서, 화면설계서, Figma 링크"),
  bullet("검수/납품: 검수기준표, 테스트 시나리오, 납품확인서, 승인 절차"),
  bullet("변경/수정: 수정요청서, 변경요청서, 회의록 승인서, 수정횟수 산정 기준"),
  bullet("권리/보안: 권리귀속표, 소스코드 인도목록, 개인정보/보안 요구사항"),
  bullet("NDA/IP: 공개 예정 자료 목록, 미공개 자산 목록, 열람자 목록, 금지할 사용 방식"),
  bullet("리스크 검토표: 조항별 위험도, 문제, 제안 문구, 협상 마지노선, 양보 가능 조건"),
  table([
    ["첨부 묶음", "포함 파일", "보내기 전 확인"],
    ["계약 원문", "계약서/수정안/별첨", "최신본/날짜"],
    ["과업 범위", "제안서/RFP/기능정의", "ID-견적 연결"],
    ["검수/납품", "기준표/시나리오/확인서", "반려 사유"],
    ["권리/보안", "권리표/보안 요구사항", "키/비밀번호 제거"],
  ]),
  line("spacer", ""),

  line("h1", "6. 회신 요청 형식"),
  line("body", "가능하면 검토 결과를 아래 항목으로 정리해 주세요."),
  bullet("조항 위치"),
  bullet("위험도: 높음 / 중간 / 낮음"),
  bullet("문제"),
  bullet("제안 문구"),
  bullet("상대방과 협상할 때 반드시 지킬 선"),
  bullet("양보 가능 조건"),
  line("spacer", ""),

  line("notice", "주의: 이 문서는 변호사 검토를 요청하기 위한 사실관계 정리본입니다. 실제 계약 체결 여부, 조항의 효력, 분쟁 가능성은 변호사 자문으로 확인해야 합니다."),
];

await mkdir(outputDir, { recursive: true });
await writeFile(sourceMd, toMarkdown(docLines), "utf8");

if (!existsSync(path.join(rhwpRepo, "Cargo.toml"))) {
  throw new Error(`rhwp repository not found: ${rhwpRepo}`);
}

const workDir = await mkdtemp(path.join(tmpdir(), "scopeguard-rhwp-lawyer-"));
try {
  await writeFile(
    path.join(workDir, "Cargo.toml"),
    `[package]
name = "scopeguard-rhwp-lawyer-doc"
version = "0.1.0"
edition = "2021"

[dependencies]
rhwp = { path = ${JSON.stringify(rhwpRepo)} }
`,
    "utf8",
  );
  await mkdir(path.join(workDir, "src"));
  await writeFile(path.join(workDir, "src/main.rs"), renderRustGenerator(docLines), "utf8");

  run("cargo", ["run", "--quiet", "--", outputHwp], workDir, { quiet: true });
  await rm(outputZip, { force: true });
  const zipDir = path.join(workDir, "zip");
  await mkdir(zipDir);
  const zipEntries = [
    ["lawyer_review_request.hwp", outputHwp],
    ["lawyer_review_request.md", sourceMd],
  ];
  if (existsSync(riskWorkbook)) {
    zipEntries.push(["contract_risk_review.xlsx", riskWorkbook]);
  }
  for (const [name, source] of zipEntries) {
    await copyFile(source, path.join(zipDir, name));
  }
  run("zip", ["-q", outputZip, ...zipEntries.map(([name]) => name)], zipDir, { quiet: true });
} finally {
  await rm(workDir, { recursive: true, force: true });
}

console.log(`wrote ${path.relative(repoRoot, outputHwp)}`);
console.log(`wrote ${path.relative(repoRoot, sourceMd)}`);
console.log(`wrote ${path.relative(repoRoot, outputZip)}`);

function line(kind, text) {
  return { kind, text };
}

function bullet(text) {
  return line("bullet", `- ${text}`);
}

function risk(text) {
  return line("risk", `[위험] ${text}`);
}

function table(rows) {
  return {
    kind: "table",
    text: tsvTable(rows),
    markdown: markdownTable(rows),
  };
}

function run(command, args, cwd, options = {}) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (!options.quiet || result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status}`);
  }
}

function toMarkdown(lines) {
  return `${lines
    .map(({ kind, text, markdown }) => {
      if (!text) return "";
      if (kind === "title") return `# ${text}`;
      if (kind === "subtitle") return `**${text}**`;
      if (kind === "h1") return `## ${text}`;
      if (kind === "h2") return `### ${text}`;
      if (kind === "bullet") return text.startsWith("- ") ? text : `- ${text}`;
      if (kind === "risk") return `- ${text}`;
      if (kind === "table") return markdown;
      if (kind === "notice") return `> ${text}`;
      return text;
    })
    .join("\n\n")}\n`;
}

function renderRustGenerator(lines) {
  const rustLines = lines
    .map(({ kind, text }) => `        DocLine { kind: ${rustString(kind)}, text: ${rustString(text)} },`)
    .join("\n");

  return `use std::{env, fs, path::Path};

struct DocLine {
    kind: &'static str,
    text: &'static str,
}

fn hwp<T>(result: Result<T, rhwp::error::HwpError>) -> Result<T, Box<dyn std::error::Error>> {
    result.map_err(|e| format!("{e}").into())
}

fn insert_table_from_tsv(
    core: &mut rhwp::document_core::DocumentCore,
    para_idx: usize,
    table_tsv: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let rows: Vec<Vec<&str>> = table_tsv
        .lines()
        .map(|row| row.split('\\t').collect())
        .collect();
    if rows.is_empty() {
        return Ok(());
    }

    let col_count = rows.iter().map(|row| row.len()).max().unwrap_or(0);
    if col_count == 0 {
        return Ok(());
    }
    let col_widths = if col_count == 3 {
        Some(vec![8500u32, 13500u32, 19900u32])
    } else {
        None
    };

    hwp(core.apply_para_format_native(
        0,
        para_idx,
        r##"{"alignment":"left","lineSpacing":140,"marginLeft":0,"marginRight":0,"indent":0,"spacingBefore":0,"spacingAfter":0}"##,
    ))?;
    hwp(core.create_table_ex_native(
        0,
        para_idx,
        0,
        rows.len() as u16,
        col_count as u16,
        true,
        col_widths.as_deref(),
    ))?;

    for (row_idx, row) in rows.iter().enumerate() {
        for col_idx in 0..col_count {
            let cell_text = row.get(col_idx).copied().unwrap_or("");
            if cell_text.is_empty() {
                continue;
            }

            let cell_idx = row_idx * col_count + col_idx;
            hwp(core.insert_text_in_cell_native(
                0,
                para_idx,
                0,
                cell_idx,
                0,
                0,
                cell_text,
            ))?;

            let char_json = if row_idx == 0 {
                r##"{"fontSize":900,"bold":true,"textColor":"#1F4E79"}"##
            } else {
                r##"{"fontSize":900,"bold":false,"textColor":"#111111"}"##
            };
            hwp(core.apply_char_format_in_cell_native(
                0,
                para_idx,
                0,
                cell_idx,
                0,
                0,
                cell_text.chars().count(),
                char_json,
            ))?;
        }
    }

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        eprintln!("usage: scopeguard-rhwp-lawyer-doc <output.hwp>");
        std::process::exit(2);
    }

    let output_hwp = &args[1];
    let lines = [
${rustLines}
    ];

    let mut core = rhwp::document_core::DocumentCore::new_empty();
    hwp(core.create_blank_document_native())?;
    hwp(core.begin_batch_native())?;

    let mut para_idx = 0usize;
    for item in lines.iter() {
        if para_idx > 0 {
            hwp(core.insert_paragraph_native(0, para_idx))?;
        }
        if item.kind == "table" {
            insert_table_from_tsv(&mut core, para_idx, item.text)?;
            para_idx += 1;
            continue;
        } else if !item.text.is_empty() {
            hwp(core.insert_text_native(0, para_idx, 0, item.text))?;
            apply_line_style(&mut core, para_idx, item)?;
        } else {
            apply_line_style(&mut core, para_idx, item)?;
        }
        para_idx += 1;
    }

    hwp(core.end_batch_native())?;

    if let Some(parent) = Path::new(output_hwp).parent() {
        fs::create_dir_all(parent)?;
    }

    let hwp_bytes = hwp(core.export_hwp_native())?;
    let reloaded = hwp(rhwp::document_core::DocumentCore::from_bytes(&hwp_bytes))?;
    if reloaded.page_count() == 0 {
        return Err("generated HWP has no pages".into());
    }
    fs::write(output_hwp, hwp_bytes)?;
    Ok(())
}

fn apply_line_style(
    core: &mut rhwp::document_core::DocumentCore,
    para_idx: usize,
    item: &DocLine,
) -> Result<(), Box<dyn std::error::Error>> {
    let len = item.text.chars().count();
    let (char_json, para_json) = match item.kind {
        "title" => (
            r##"{"fontSize":1900,"bold":true,"textColor":"#1F4E79"}"##,
            r##"{"alignment":"center","lineSpacing":150,"spacingBefore":0,"spacingAfter":1800,"keepWithNext":true}"##,
        ),
        "subtitle" => (
            r##"{"fontSize":1200,"bold":true,"textColor":"#404040"}"##,
            r##"{"alignment":"center","lineSpacing":150,"spacingAfter":900,"keepWithNext":true}"##,
        ),
        "meta" => (
            r##"{"fontSize":950,"textColor":"#595959"}"##,
            r##"{"alignment":"center","lineSpacing":140,"spacingAfter":300}"##,
        ),
        "h1" => (
            r##"{"fontSize":1350,"bold":true,"textColor":"#1F4E79"}"##,
            r##"{"alignment":"left","lineSpacing":150,"spacingBefore":1200,"spacingAfter":500,"keepWithNext":true}"##,
        ),
        "h2" => (
            r##"{"fontSize":1120,"bold":true,"textColor":"#404040"}"##,
            r##"{"alignment":"left","lineSpacing":145,"spacingBefore":700,"spacingAfter":300,"keepWithNext":true}"##,
        ),
        "bullet" => (
            r##"{"fontSize":1000,"textColor":"#111111"}"##,
            r##"{"alignment":"justify","lineSpacing":150,"marginLeft":900,"indent":-450,"spacingAfter":220}"##,
        ),
        "risk" => (
            r##"{"fontSize":1000,"bold":true,"textColor":"#9C0006"}"##,
            r##"{"alignment":"justify","lineSpacing":150,"marginLeft":900,"indent":-450,"spacingAfter":260}"##,
        ),
        "notice" => (
            r##"{"fontSize":950,"textColor":"#595959"}"##,
            r##"{"alignment":"justify","lineSpacing":145,"marginLeft":600,"marginRight":600,"spacingBefore":900,"spacingAfter":0}"##,
        ),
        "spacer" => (
            r##"{"fontSize":600,"textColor":"#FFFFFF"}"##,
            r##"{"alignment":"left","lineSpacing":100,"spacingAfter":200}"##,
        ),
        _ => (
            r##"{"fontSize":1000,"textColor":"#111111"}"##,
            r##"{"alignment":"justify","lineSpacing":150,"spacingAfter":250}"##,
        ),
    };

    if len > 0 {
        hwp(core.apply_char_format_native(0, para_idx, 0, len, char_json))?;
    }
    hwp(core.apply_para_format_native(0, para_idx, para_json))?;
    Ok(())
}
`;
}

function rustString(value) {
  return `"${value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\t", "\\t")
    .replaceAll("\n", "\\n")}"`;
}

function tsvTable(rows) {
  return rows.map((row) => row.join("\t")).join("\n");
}

function markdownTable(rows) {
  const [head, ...body] = rows;
  return [
    `| ${head.map(escapeMarkdownCell).join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.map(escapeMarkdownCell).join(" | ")} |`),
  ].join("\n");
}

function escapeMarkdownCell(value) {
  return value.replaceAll("|", "\\|");
}
