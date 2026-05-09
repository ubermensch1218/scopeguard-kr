# scopeguard-kr

SW 외주개발계약에서 반복되는 과업범위, 검수, 수정횟수, 변경요청, 회의기록 분쟁을 줄이기 위한 계약문서 생성 오픈 프로젝트입니다.

목적은 소송 자동화가 아닙니다. 말뿐인 가이드라인을 보여주는 것도 아닙니다. 견적 row, 전제조건, 완수 조건, 테스트 조건, 부수 항목을 입력하면 그 기준이 계약서 본문과 부속서류에 반영되도록 만드는 것이 목적입니다.

한 줄로 말하면:

> “누가 이긴다”를 예측하는 도구가 아니라, “이 요청이 하자인지, 무상수정인지, 변경요청인지”를 계약 기준으로 분리하게 만드는 계약서 작성기입니다.

## What It Builds

현재 MVP는 선택형 입력값과 견적 row를 받아 DOCX/XLSX 계약문서 패키지를 생성합니다.

- 계약서 초안
- RFP 및 과업내용서
- 검수기준표
- 수정요청서
- 변경요청서
- 회의록 승인서
- 납품확인서
- 하자신고서
- 대금 및 마일스톤 지급표
- 권리귀속 및 소스코드 인도목록
- 운영비/API/계정 인수인계서
- 개인정보 및 보안 요구사항
- 공급자/수요자 합의표
- 견적산정표
- 기능별 구현·디자인 명세서
- 착수자료 확정표
- 검수실행 기록표
- 계약서 리스크 검토표
- 선택 별첨

선택 별첨은 입력값에서 켠 경우에만 생성됩니다.

- `16_선택별첨_디자인_UX_수정범위.docx`
- `17_선택별첨_수정횟수_산정표.docx`

## Quickstart

```bash
npm run check
npm run audit:publish
npm run build:docs
```

생성 결과는 `output/`에 저장됩니다.

```text
output/
  03_SW_개발용역계약서_초안.docx
  04_검수기준표.docx
  15_견적산정표.docx
  18_기능별_구현_디자인_명세서.docx
  19_착수자료_확정표.xlsx
  20_검수실행_기록표.xlsx
  21_계약서_리스크_검토표.xlsx
  scopeguard_sw_contract_docs.zip
```

입력 파일을 지정할 수도 있습니다.

```bash
node scripts/build-docx-package.mjs --input data/contract-input.sample.json
node scripts/build-docx-package.mjs --input data/contract-input.design.sample.json
node scripts/build-docx-package.mjs --input data/contract-input.ops.sample.json
```

공개 전에는 `npm run audit:publish`를 먼저 실행합니다. 이 명령은 공개용 샘플 3종을 모두 DOCX/XLSX로 생성하고, 문서 무결성, 선택 별첨 on/off, 견적 row 연결, 양식별 필수 내용, 민감 문자열 포함 여부를 확인합니다.

정적 웹 입력 화면은 아래 명령으로 확인합니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:4173`을 열면 됩니다.

## Core Input

핵심 입력 단위는 견적 row입니다. 금액만 넣는 견적서가 아니라, “이 금액이 어떤 조건에서 유효한지”를 같이 잠그는 구조입니다.

| 필드 | 의미 |
|---|---|
| `id` | 견적 항목 ID |
| `item` | 작업 항목명 |
| `linkedRequirementIds` | 연결 요구사항 또는 기능 ID |
| `unit` | 시간, 반일, 일, 건, 화면, 기능 등 |
| `quantity` | 산정 수량 |
| `unitPrice` | 단가 |
| `amount` | 금액 |
| `preconditions` | 해당 금액이 유지되는 전제조건 |
| `completionCondition` | 완료로 볼 조건 |
| `testCondition` | 검수 때 확인할 테스트 조건 |
| `subItems` | row 안에 포함되는 세부 작업 |
| `disputeReduced` | 이 row가 줄이는 분쟁 유형 |

이 row는 계약서, RFP, 검수기준표, 대금표, 견적산정표에 같이 반영됩니다.

기능별 구현·디자인 명세는 `featureSpecs`로 입력합니다.

| 필드 | 의미 |
|---|---|
| `entryPoints` | 화면, 버튼, URL, 메뉴, 알림 등 기능 진입 경로 |
| `designRequirements` | 디자인 기준 충족 여부와 판단 기준 |
| `flow` | Mermaid 원문 기반 디자인 플로우 |
| `flowSvg` | 필요 시 첨부하는 SVG 렌더링 결과 |
| `finalScreens` | 최종 화면 또는 상태 |
| `finalResults` | 저장, 이동, 알림, 데이터 변경 등 최종 결과 |
| `completionCondition` | 완료로 볼 조건 |
| `testCondition` | 검수 때 확인할 테스트 조건 |

## Why

개발용역 분쟁은 대부분 개발 자체보다 계약 전후 구조가 열려 있어서 커집니다.

- PRD, 기능정의서, 화면설계서 없이 착수
- 검수기준 없이 납품
- 하자, 경미한 수정, UX 개선, 신규 기능이 한 요청에 섞임
- 무상수정 횟수와 “수정 1회” 기준이 없음
- 대면회의와 구두요청이 계약 범위처럼 주장됨
- 변경요청의 비용/일정 조정 절차가 없음

`scopeguard-kr`는 이 항목들을 체크리스트로만 보여주지 않고, 계약서 조항과 부속서류 표에 반영합니다.

## Project Structure

```text
.github/
  workflows/audit.yml     # PR/push 공개 경계와 DOCX/XLSX 생성 audit
  ISSUE_TEMPLATE/         # 공개 이슈 입력 양식
  pull_request_template.md

assets/
  app.js                  # 정적 웹 입력 화면 로직
  styles.css              # 정적 웹 UI

data/
  contract-input.sample.json          # 기본형
  contract-input.design.sample.json   # 디자인/UX 별첨 포함형
  contract-input.ops.sample.json      # 운영/API 인수인계 포함형
  event-schema.sample.json
  question-overlays.sample.json

scripts/
  build-docx-package.mjs  # DOCX/XLSX 패키징과 ZIP 생성
  audit-publish.mjs       # 공개 전 샘플 빌드와 문자열 점검
  check-data.mjs          # 필수 파일 점검
  docx/
    helpers.mjs           # 공통 문단, 표, 값 포맷
    docs/*.mjs            # DOCX별 문서 빌더
  xlsx/
    writer.mjs            # XLSX 패키징
    workbooks/*.mjs       # XLSX별 워크북 빌더

templates/                # 문서/룰셋 초안
docs/                     # PRD, 데이터 모델, 참고문헌, 감사 기록
samples/                  # 계약서 표본
```

DOCX 내용은 `scripts/docx/docs/*.mjs`, XLSX 내용은 `scripts/xlsx/workbooks/*.mjs`에 문서별로 분리되어 있습니다. `scripts/build-docx-package.mjs`는 공통 패키징과 ZIP 생성을 담당합니다.

## Publish Boundary

GitHub에는 소스, 템플릿, 익명화된 샘플만 올립니다. 실계약 입력값, 업로드 원본 문서, 생성 DOCX/XLSX/ZIP, 환경변수, 로컬 실행 상태는 올리지 않습니다.

공개 대상:

- `README.md`, `CONTRIBUTING.md`, `LICENSE`
- `.github/`
- `index.html`, `assets/`
- `scripts/`, `templates/`, `docs/`
- `samples/`
- `data/*.sample.json`
- `.claude/skills/sw-contract-scopeguard/`
- `.codex/skills/sw-contract-scopeguard/`

비공개/ignore 대상:

- `output/`
- `private/`, `.private/`, `local/`, `tmp/`
- `data/contract-input.json`
- `data/*.local.json`, `data/*.private.json`
- `data/uploads/`, `data/raw/`
- `.env*`, `.dev.vars`, `.wrangler/`
- 로컬 assistant/runtime state

자세한 기준은 `docs/publish-boundary.md`에 정리되어 있습니다.

PR 리뷰 기준은 `docs/pr-review-checklist.md`에 있습니다. 공개 PR은 `npm run audit:publish`를 통과해야 합니다.

## Roadmap And Participation

- 로드맵: `docs/roadmap.md`
- 변호사 참여 안내: `docs/lawyer-participation.md`
- 참여자 니즈 수집 기준: `docs/stakeholder-needs.md`

변호사 리뷰는 조항의 승패 판단이 아니라, 하자·무상수정·변경요청·검수·회의록·권리귀속의 경계를 더 명확하게 만드는 방향으로 받습니다. 발주자, 수급자, PM, 디자이너, 개발사, 플랫폼 운영자의 니즈는 `Stakeholder need` 이슈 템플릿으로 받습니다.

## Skill First

초기 사용 흐름은 웹앱보다 Claude/Codex Skill 형태를 우선합니다.

- `.claude/skills/sw-contract-scopeguard/SKILL.md`
- `.codex/skills/sw-contract-scopeguard/SKILL.md`

`sw-contract-scopeguard`는 최상단 orchestrator skill입니다. 문서별 작성법은 각 skill 폴더의 `references/documents/{문서번호-이름}/recipe.md`에 나눠 둡니다.

웹앱은 입력 보조 화면입니다. 최종 계약 문구 확정이나 법률 판단을 대신하지 않습니다.

## References

참고문헌은 계약 조항의 판단 근거처럼 쓰지 않고, 사람이 확인할 수 있는 공개 링크 목록으로만 둡니다.

- 공정거래위원회/한국공정거래조정원 분쟁조정 사례
- 소프트웨어사업 계약 및 관리감독에 관한 지침
- 조달청 e-발주시스템/RFP 작성 구조
- `chrisryugj/korean-law-mcp`: 법제처 API 기반 법령·공개문서·행정규칙 조회
- `chrisryugj/kordoc`: HWP/HWPX/PDF/DOCX/XLSX 문서 파싱·비교·생성

정리된 참고 목록은 `docs/reference-bibliography.md`와 `docs/legal-mcp-findings.md`에 있습니다.

외부 실무 글은 공개 참고문헌이나 계약 조항의 출처로 직접 싣지 않습니다. 요구사항 정의, 결과물 형식, 수정 범위, 유지보수 범위, 대금 정산, 업무 범위, 산출물 사용 범위처럼 반복되는 작성 패턴만 제품 문항으로 추상화합니다.

## Review Needed

이 저장소는 법률 자문을 제공하지 않습니다. 아래 항목에 대한 변호사와 실무자의 검토가 필요합니다.

- SW 외주개발계약에서 하자와 변경요청의 경계
- 무상수정 횟수와 통합 수정요청 1회 기준
- 디자인/UX 선호 변경과 검수 반려의 경계
- 대면회의, 구두요청, 회의록 승인 조항
- 검수기준과 승인간주 조항
- 소스코드, 사전보유자산, 오픈소스 권리 귀속
- 개인정보 처리위탁과 운영비/API비 부담 기준

## Repository Name

추천 저장소 이름:

```text
ubermensch1218/scopeguard-kr
```
