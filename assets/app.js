const rfpItems = [
  {
    id: "prd",
    label: "PRD 또는 요구사항 정의서",
    prompt: "문제, 사용자, 핵심 기능, 제외 범위를 문서화했는가?",
  },
  {
    id: "features",
    label: "기능정의서",
    prompt: "기능별 입력, 처리, 출력, 권한, 예외조건을 적었는가?",
  },
  {
    id: "screens",
    label: "화면설계서/Figma",
    prompt: "화면 목록과 화면별 주요 상태가 있는가?",
  },
  {
    id: "flow",
    label: "사용자 플로우",
    prompt: "가입, 로그인, 작성, 조회, 승인, 오류 흐름을 정의했는가?",
  },
  {
    id: "data",
    label: "데이터/API 범위",
    prompt: "DB 항목, 외부 API, 계정/API 키, 데이터 이관 범위가 있는가?",
  },
  {
    id: "design",
    label: "디자인 기준",
    prompt: "브랜드, 색상, 폰트, 라운딩, 간격, 레퍼런스 승인 기준이 있는가?",
  },
  {
    id: "acceptance",
    label: "검수 기준",
    prompt: "기능별 합격 기준과 재현 절차가 있는가?",
  },
  {
    id: "deliverables",
    label: "납품물",
    prompt: "소스코드, 운영 URL, 계정, DB 구조, 운영가이드 등 목록이 있는가?",
  },
  {
    id: "exclusions",
    label: "제외 범위",
    prompt: "계약에 자동 포함되지 않는 기능과 운영지원 범위를 적었는가?",
  },
  {
    id: "revisions",
    label: "수정횟수 기준",
    prompt: "무상수정 총 횟수와 통합 수정요청 1회 기준이 있는가?",
  },
  {
    id: "cr",
    label: "변경요청 절차",
    prompt: "신규 기능, 신규 화면, 데이터 변경의 비용/일정 조정 기준이 있는가?",
  },
  {
    id: "payment",
    label: "대금/정산",
    prompt: "지급 시기, 지급 조건, 중도 종료 시 기성 정산 기준이 있는가?",
  },
  {
    id: "asset-use",
    label: "산출물/자료 사용",
    prompt: "소스코드, 디자인, 콘텐츠, 포트폴리오 사용 가능 범위가 있는가?",
  },
  {
    id: "meetings",
    label: "회의/커뮤니케이션",
    prompt: "대면회의 횟수, 회의록 승인, 구두요청 효력 제한이 있는가?",
  },
];

const riskRules = [
  {
    id: "unlimited-revision",
    severity: "critical",
    title: "무상수정 무제한 위험",
    hit: /(무제한|계약기간\s*내\s*수정|만족(?:할\s*때)?까지|수시\s*수정)/,
    miss: null,
    recommendation: "무상수정은 총 횟수와 1회 기준을 정하고, 하자와 변경요청을 분리하세요.",
    weight: 18,
  },
  {
    id: "acceptance-missing",
    severity: "critical",
    title: "검수 기준 누락",
    hit: null,
    miss: /(검수|검사|합격\s*기준|Acceptance|재현\s*절차|승인\s*간주)/,
    recommendation: "기능별 검수 기준, 반려 기한, 미통지 시 승인간주 조항을 추가하세요.",
    weight: 16,
  },
  {
    id: "scope-missing",
    severity: "critical",
    title: "과업 범위 누락",
    hit: null,
    miss: /(구현\s*범위|과업\s*범위|계약\s*범위|기능\s*목록|RFP|요구사항|SOW)/,
    recommendation: "포함 기능, 제외 기능, 납품물을 표로 고정하세요.",
    weight: 16,
  },
  {
    id: "cr-missing",
    severity: "critical",
    title: "변경요청 절차 누락",
    hit: null,
    miss: /(변경\s*요청|Change\s*Request|CR|별도\s*견적|일정\s*조정|계약금액\s*조정)/i,
    recommendation: "승인된 PRD/화면설계/데이터 구조 변경은 CR로 처리하는 조항을 추가하세요.",
    weight: 14,
  },
  {
    id: "payment-missing",
    severity: "critical",
    title: "대금 지급·정산 기준 누락",
    hit: null,
    miss: /(대금|보수|계약금|중도금|잔금|지급\s*기한|세금계산서|청구서|기성|정산)/,
    recommendation: "지급 시기, 지급 조건, 미지급 시 조치, 중도 종료 시 기성 정산 기준을 추가하세요.",
    weight: 13,
  },
  {
    id: "termination-missing",
    severity: "warning",
    title: "중도 종료 기준 누락",
    hit: null,
    miss: /(해제|해지|중도\s*종료|계약\s*종료|기성|정산|최고|귀책)/,
    recommendation: "중도 종료 사유, 이행 최고, 기성 산출물 정산, 자료 인도 기준을 추가하세요.",
    weight: 8,
  },
  {
    id: "verbal-risk",
    severity: "warning",
    title: "구두 요청 효력 위험",
    hit: /(구두|전화|카카오톡|카톡|회의\s*중\s*요청|협의하여\s*진행|필요시\s*협의)/,
    miss: null,
    recommendation: "구두 요청은 플랫폼/이메일/서면 요청으로 전환되어야 효력이 있다고 명시하세요.",
    weight: 10,
  },
  {
    id: "meeting-missing",
    severity: "warning",
    title: "대면회의 비용·횟수 누락",
    hit: null,
    miss: /(대면|회의|미팅|출장|워크숍|시연회|회의록)/,
    recommendation: "대면 미팅 포함 횟수, 1회 기준 시간, 초과 비용, 회의록 승인 기준을 추가하세요.",
    weight: 10,
  },
  {
    id: "ip-missing",
    severity: "warning",
    title: "소스코드·사전보유자산 귀속 불명확",
    hit: null,
    miss: /(소스코드|저작재산권|지식재산|사전보유자산|오픈소스|라이브러리|공통\s*모듈)/,
    recommendation: "프로젝트 전용 산출물과 수급자 사전보유자산을 분리하세요.",
    weight: 9,
  },
  {
    id: "ops-cost-missing",
    severity: "warning",
    title: "운영비/API비 부담 주체 누락",
    hit: null,
    miss: /(서버|API|도메인|문자|스토리지|운영비|라이선스|클라우드|비용\s*부담)/,
    recommendation: "서버, AI API, 문자, 도메인, 라이선스 비용의 부담 주체와 기간을 명시하세요.",
    weight: 8,
  },
  {
    id: "design-vague",
    severity: "warning",
    title: "주관적 디자인 검수 표현",
    hit: /(예쁘게|고급스럽게|세련되게|사용성\s*개선|UX\s*개선|디자인\s*개선|만족도)/,
    miss: null,
    recommendation: "디자인 검수는 화면설계/Figma/컴포넌트 기준으로 고정하고 선호 변경은 수정 또는 CR로 분리하세요.",
    weight: 8,
  },
];

const legalReferences = [
  {
    title: "소프트웨어사업 계약 및 관리감독에 관한 지침",
    note: "RFP 요구사항 분류와 과업 변경 절차를 설계할 때 참고.",
    url: "https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000223356",
  },
  {
    title: "소프트웨어 진흥법",
    note: "SW 계약에서 과업 범위와 계약 내용을 명확히 해야 하는 취지를 확인할 때 참고.",
    url: "https://www.law.go.kr/법령/소프트웨어진흥법",
  },
  {
    title: "한국공정거래조정원 분쟁조정 사례",
    note: "시스템 소프트웨어 개발 및 공급업자의 거래상 지위 남용 관련 분쟁 유형 참고.",
    url: "https://fairnet.kofair.or.kr/web/user/exam/case/402/162/exam402List.do",
  },
  {
    title: "공정위 결정 18877",
    note: "조달청 등 발주 소프트웨어 테스팅 시스템 구매 입찰 관련 결정.",
    url: "https://www.law.go.kr/DRF/lawService.do?target=ftc&ID=18877&type=HTML",
  },
  {
    title: "공정위 결정 15923",
    note: "부산 북구청 등 4개 지자체 온나라시스템 구축 입찰 관련 결정.",
    url: "https://www.law.go.kr/DRF/lawService.do?target=ftc&ID=15923&type=HTML",
  },
  {
    title: "공정위 결정 15561",
    note: "11개 시·도 교육청 교육기관용 소프트웨어 라이선스 구매 입찰 관련 결정.",
    url: "https://www.law.go.kr/DRF/lawService.do?target=ftc&ID=15561&type=HTML",
  },
  {
    title: "대법원 공개문서 2021다236111",
    note: "프로그램 권리 귀속과 사전보유자산 분리 필요성을 확인할 때 참고.",
    url: "https://www.law.go.kr/DRF/lawService.do?target=prec&ID=226981&type=HTML",
  },
];

const agreementOptions = [
  {
    item: "착수자료",
    demand: "원하는 기능 누락 방지",
    supply: "불명확한 요구 착수 방지",
    balanced: "PRD/기능정의/화면설계/검수기준이 확정된 기능부터 착수",
  },
  {
    item: "무상수정",
    demand: "납품 후 피드백 반영권 확보",
    supply: "무한 수정 방지",
    balanced: "전체 2회 또는 마일스톤별 1회, 통합 수정요청 1세트 = 1회",
  },
  {
    item: "하자",
    demand: "계약한 기능의 정상 동작 보장",
    supply: "하자와 기획 변경 분리",
    balanced: "재현 가능한 오류/검수기준 미달은 무상 보완, 수정횟수 미차감",
  },
  {
    item: "변경요청",
    demand: "필요 변경 가능",
    supply: "범위 변경의 비용·일정 보전",
    balanced: "신규 기능/화면/데이터/API/승인사항 번복은 CR 승인 후 착수",
  },
  {
    item: "회의",
    demand: "중요 의사결정 기록",
    supply: "구두요청 분쟁 방지",
    balanced: "대면 2회 포함, 회의록 승인된 내용만 확정사항",
  },
];

const optionalAppendixMeta = [
  {
    key: "designUx",
    filename: "16_선택별첨_디자인_UX_수정범위.docx",
    label: "디자인/UX 수정 범위 별첨",
    contractLabel: "별첨 A. 디자인/UX 수정 범위",
  },
  {
    key: "revisionCounting",
    filename: "17_선택별첨_수정횟수_산정표.docx",
    label: "수정횟수 산정 로직 별첨",
    contractLabel: "별첨 B. 수정횟수 산정표",
  },
];

const designUxRevisionCases = [
  ["더 예쁘게, 더 고급스럽게", "분류 불가", "정량 기준 또는 레퍼런스가 없으면 검수 반려 사유가 아님", "기준 이미지, 컴포넌트, 화면설계 기준을 먼저 확정"],
  ["라운딩 8px을 12px로 변경", "경미한 수정", "동일 통합 수정요청서에 포함된 경우 해당 회차 안에서 처리", "전체 디자인 방향 변경이면 변경요청"],
  ["A안으로 승인한 화면을 B안으로 변경", "변경요청", "승인사항 번복으로 보며 비용·일정 재산정", "기존 row의 전제조건 또는 완수 조건 변경"],
  ["버튼명, 안내 문구, 오탈자 수정", "경미한 수정", "발주자가 최종 문안을 서면 제공하면 해당 회차 안에서 처리", "전문 문구의 정확성은 발주자 확인 필요"],
  ["사용자 흐름을 3단계에서 1단계로 변경", "변경요청", "화면 구조와 정보구조 변경을 수반", "새 완수 조건과 테스트 조건 필요"],
  ["화면설계서에 있는 상태가 구현되지 않음", "하자", "계약 범위와 검수 기준에 있는 항목이면 수정횟수 미차감", "재현 절차와 기대 결과 제출"],
];

const revisionCountingRows = [
  ["통합 수정요청 1세트", "1회", "산출물 제출 후 정해진 기간 안에 서면으로 묶어 제출한 요청 묶음"],
  ["동일 기간 내 복수 항목", "1회", "문구, 이미지, 색상, 간격 등 여러 항목이 있어도 같은 요청서면 1회"],
  ["분할 제출", "별도 1회", "같은 산출물에 대한 의견을 나누어 추가 제출하면 새 회차"],
  ["반영 후 방향 변경", "별도 1회 또는 변경요청", "A로 고친 뒤 B로 바꾸는 요청은 기존 미반영이 아님"],
  ["수급자 미반영 재작업", "미차감", "승인된 수정요청을 수급자가 반영하지 못한 경우"],
  ["재현 가능한 하자", "미차감", "계약 범위 기능 불능 또는 검수 기준 미달"],
  ["신규 기능/화면/데이터 구조 변경", "변경요청", "수정횟수 차감이 아니라 별도 비용·일정 합의"],
];

const overlayItems = [
  {
    field: "견적 row",
    memo: "기능/작업 묶음별 단위, 수량, 단가, 전제조건, 완수 조건, 테스트 조건, 부수 항목을 남깁니다.",
    dispute: "총액에 모든 작업이 포함됐다는 주장",
    reflected: "계약서, RFP, 대금표, 견적산정표",
  },
  {
    field: "전제조건",
    memo: "자료 제공, 승인, 외부 API 준비 등 이 금액이 유지되는 조건입니다.",
    dispute: "견적 범위 확대, 일정 지연 책임",
    reflected: "착수 조건 조항, 견적산정표",
  },
  {
    field: "완수 조건",
    memo: "이 row가 끝났다고 볼 조건을 발주자와 수급자가 같은 문장으로 적습니다.",
    dispute: "완료 여부 다툼",
    reflected: "계약서, RFP, 검수기준표",
  },
  {
    field: "테스트 조건",
    memo: "검수 때 확인할 방식과 시나리오입니다.",
    dispute: "검수 방식 다툼",
    reflected: "검수기준표, 하자신고서",
  },
  {
    field: "부수 항목",
    memo: "큰 row 안에 포함되는 세부 작업입니다. 밖의 작업은 별도 row 또는 변경요청입니다.",
    dispute: "세부 작업 포함 여부 다툼",
    reflected: "계약서 과업 범위, RFP",
  },
];

let estimateRows = [
  {
    id: "EST-001",
    item: "요구사항/RFP 정리",
    requirement: "FUNC-001, FUNC-002",
    unit: "일",
    quantity: 2,
    unitPrice: 800000,
    preconditions: "발주자가 초안 자료와 레퍼런스를 제공",
    completionCondition: "요구사항 목록과 검수 기준 초안이 작성됨",
    testCondition: "각 기능 ID와 완료 기준이 연결되어 있는지 확인",
    subItems: "요구사항 목록, 검수 기준, 제외 범위",
    disputeReduced: "기획 미확정 착수, 누락 기능 주장",
  },
  {
    id: "EST-002",
    item: "로그인/사용자 화면 구현",
    requirement: "FUNC-001",
    unit: "일",
    quantity: 5,
    unitPrice: 800000,
    preconditions: "화면설계서와 디자인 기준 확정",
    completionCondition: "정상 계정 로그인과 오류 메시지 표시가 동작",
    testCondition: "정상 계정, 비밀번호 오류, 미가입 계정 테스트",
    subItems: "로그인 화면, 로그인 API, 오류 표시",
    disputeReduced: "화면 범위 확대, 완료 기준 불일치",
  },
];

let selectedEstimateIndex = 0;
const analyticsEvents = [];

const els = {
  projectName: document.querySelector("#project-name"),
  buyerName: document.querySelector("#buyer-name"),
  supplierName: document.querySelector("#supplier-name"),
  contractType: document.querySelector("#contract-type"),
  revisionPolicy: document.querySelector("#revision-policy"),
  meetingPolicy: document.querySelector("#meeting-policy"),
  brief: document.querySelector("#brief"),
  rfpChecks: document.querySelector("#rfp-checks"),
  rfpOutput: document.querySelector("#rfp-output"),
  contractText: document.querySelector("#contract-text"),
  riskResults: document.querySelector("#risk-results"),
  riskOutput: document.querySelector("#risk-output"),
  riskScore: document.querySelector("#risk-score"),
  riskBand: document.querySelector("#risk-band"),
  fileInput: document.querySelector("#file-input"),
  downloadBundle: document.querySelector("#download-bundle"),
  downloadContract: document.querySelector("#download-contract"),
  agreementTable: document.querySelector("#agreement-table"),
  downloadAgreement: document.querySelector("#download-agreement"),
  downloadRisk: document.querySelector("#download-risk"),
  estimateRows: document.querySelector("#estimate-rows"),
  addEstimateRow: document.querySelector("#add-estimate-row"),
  estimateTotal: document.querySelector("#estimate-total"),
  overlayList: document.querySelector("#overlay-list"),
  writerChecks: document.querySelector("#writer-checks"),
  selectedRowEditor: document.querySelector("#selected-row-editor"),
  reflectionMap: document.querySelector("#reflection-map"),
  buyerEstimateOutput: document.querySelector("#buyer-estimate-output"),
  exportEstimateRows: document.querySelector("#export-estimate-rows"),
  importEstimateRows: document.querySelector("#import-estimate-rows"),
  importEstimateRowsFile: document.querySelector("#import-estimate-rows-file"),
  appendixDesignUx: document.querySelector("#appendix-design-ux"),
  appendixRevisionCounting: document.querySelector("#appendix-revision-counting"),
};

let currentRole = "buyer";
let contractMarkdown = "";
let riskMarkdown = "";
const previewTokens = new WeakMap();
window.scopeguardEventLog = analyticsEvents;

function renderChecks() {
  els.rfpChecks.innerHTML = rfpItems
    .map(
      (item) => `
        <div class="check-item">
          <label>
            <input type="checkbox" data-check="${item.id}" />
            <span>${item.label}<br><small>${item.prompt}</small></span>
          </label>
        </div>
      `,
    )
    .join("");
}

function checkedMap() {
  const entries = [...document.querySelectorAll("[data-check]")].map((input) => [
    input.dataset.check,
    input.checked,
  ]);
  return Object.fromEntries(entries);
}

function roleLabel() {
  return {
    buyer: "발주자",
    supplier: "수급자",
    neutral: "중립 합의안",
  }[currentRole];
}

function revisionText() {
  return {
    "2-total":
      "본 계약에 포함된 무상수정은 전체 프로젝트 기준 총 2회로 한다.",
    "1-milestone":
      "본 계약에 포함된 무상수정은 각 마일스톤별 1회로 하며, 동일 마일스톤 내 통합 수정요청 1세트를 1회로 본다.",
    "defect-only":
      "본 계약에는 별도 무상수정을 포함하지 않으며, 계약 범위 기능의 하자에 한하여 무상 보완한다.",
  }[els.revisionPolicy.value];
}

function meetingText() {
  return {
    "2-onsite":
      "본 계약에 포함된 대면회의는 전체 프로젝트 기준 총 2회로 하며, 1회는 최대 90분으로 한다.",
    "1-onsite":
      "본 계약에 포함된 대면회의는 전체 프로젝트 기준 총 1회로 하며, 1회는 최대 90분으로 한다.",
    "online-only":
      "본 계약에는 대면회의를 포함하지 않으며, 회의는 온라인을 원칙으로 한다.",
  }[els.meetingPolicy.value];
}

function optionalAppendixContractSection() {
  const selected = selectedAppendices();
  if (!selected.length) return "";
  return `
## 제9조 선택 별첨

양 당사자가 아래 별첨을 본 계약에 포함하기로 선택한 경우에만 해당 별첨의 기준을 적용한다. 선택하지 않은 별첨은 본 계약에 자동 포함되지 않는다.

${selected.map((item) => `- ${item.contractLabel}: ${item.filename}`).join("\n")}
`;
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function rowAmount(row) {
  return Number(row.quantity || 0) * Number(row.unitPrice || 0);
}

function estimateTotal() {
  return estimateRows.reduce((sum, row) => sum + rowAmount(row), 0);
}

function markdownTable(headers, rows) {
  const safeRows = rows.length ? rows : [headers.map(() => "")];
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...safeRows.map((row) => `| ${row.map((value) => String(value ?? "").replace(/\n/g, "<br>")).join(" | ")} |`),
  ].join("\n");
}

function estimateMarkdownRows() {
  return estimateRows.map((row) => [
    row.id,
    row.item,
    row.requirement,
    row.unit,
    row.quantity,
    formatMoney(row.unitPrice),
    formatMoney(rowAmount(row)),
    row.preconditions,
    row.completionCondition,
    row.testCondition,
    row.subItems,
    row.disputeReduced,
  ]);
}

function trackEvent(name, payload = {}) {
  analyticsEvents.push({
    name,
    at: new Date().toISOString(),
    role: currentRole,
    rowCount: estimateRows.length,
    payload,
  });
}

function selectedEstimateRow() {
  return estimateRows[selectedEstimateIndex] || estimateRows[0] || null;
}

function appendixSelections() {
  return {
    designUx: Boolean(els.appendixDesignUx?.checked),
    revisionCounting: Boolean(els.appendixRevisionCounting?.checked),
  };
}

function selectedAppendices() {
  const selected = appendixSelections();
  return optionalAppendixMeta.filter((item) => selected[item.key]);
}

function renderOptionalFiles() {
  const selected = appendixSelections();
  document.querySelectorAll("[data-optional-file]").forEach((item) => {
    item.classList.toggle("hidden", !selected[item.dataset.optionalFile]);
  });
}

function renderEstimateRows() {
  els.estimateRows.innerHTML = estimateRows
    .map(
      (row, index) => `
        <tr data-estimate-index="${index}" class="${index === selectedEstimateIndex ? "active-row" : ""}">
          <td><button class="select-row-button" type="button" data-select-estimate-row="${index}">선택</button></td>
          <td><input data-estimate-field="id" value="${escapeXml(row.id)}" aria-label="견적 ID" /></td>
          <td><textarea data-estimate-field="item" aria-label="항목명">${escapeXml(row.item)}</textarea></td>
          <td><input data-estimate-field="requirement" value="${escapeXml(row.requirement)}" aria-label="연결 기능" /></td>
          <td>
            <select data-estimate-field="unit" aria-label="단위">
              ${["시간", "반일", "일", "건", "화면", "기능"].map((unit) => `<option value="${unit}" ${row.unit === unit ? "selected" : ""}>${unit}</option>`).join("")}
            </select>
          </td>
          <td><input data-estimate-field="quantity" type="number" min="0" step="0.5" value="${escapeXml(row.quantity)}" aria-label="수량" /></td>
          <td><input data-estimate-field="unitPrice" type="number" min="0" step="10000" value="${escapeXml(row.unitPrice)}" aria-label="단가" /></td>
          <td class="money-cell">${formatMoney(rowAmount(row))}</td>
          <td><textarea data-estimate-field="preconditions" aria-label="전제조건">${escapeXml(row.preconditions)}</textarea></td>
          <td><textarea data-estimate-field="completionCondition" aria-label="완수 조건">${escapeXml(row.completionCondition)}</textarea></td>
          <td><textarea data-estimate-field="testCondition" aria-label="테스트 조건">${escapeXml(row.testCondition)}</textarea></td>
          <td><textarea data-estimate-field="subItems" aria-label="부수 항목">${escapeXml(row.subItems)}</textarea></td>
          <td><textarea data-estimate-field="disputeReduced" aria-label="줄이는 분쟁">${escapeXml(row.disputeReduced)}</textarea></td>
        </tr>
      `,
    )
    .join("");
  els.estimateTotal.textContent = `합계 ${formatMoney(estimateTotal())}`;
}

function renderSelectedRowEditor() {
  const row = selectedEstimateRow();
  if (!row) {
    els.selectedRowEditor.innerHTML = '<p class="muted-line">선택된 row가 없습니다.</p>';
    return;
  }
  els.selectedRowEditor.innerHTML = `
    <div class="row-editor-form">
      <label>ID<input data-panel-field="id" value="${escapeXml(row.id)}" /></label>
      <label>연결 기능<input data-panel-field="requirement" value="${escapeXml(row.requirement)}" /></label>
      <label class="wide">항목명<textarea data-panel-field="item">${escapeXml(row.item)}</textarea></label>
      <label>단위
        <select data-panel-field="unit">
          ${["시간", "반일", "일", "건", "화면", "기능"].map((unit) => `<option value="${unit}" ${row.unit === unit ? "selected" : ""}>${unit}</option>`).join("")}
        </select>
      </label>
      <label>수량<input data-panel-field="quantity" type="number" min="0" step="0.5" value="${escapeXml(row.quantity)}" /></label>
      <label>단가<input data-panel-field="unitPrice" type="number" min="0" step="10000" value="${escapeXml(row.unitPrice)}" /></label>
      <label>금액<input data-panel-amount value="${formatMoney(rowAmount(row))}" readonly /></label>
      <label class="wide">전제조건<textarea data-panel-field="preconditions">${escapeXml(row.preconditions)}</textarea></label>
      <label class="wide">완수 조건<textarea data-panel-field="completionCondition">${escapeXml(row.completionCondition)}</textarea></label>
      <label class="wide">테스트 조건<textarea data-panel-field="testCondition">${escapeXml(row.testCondition)}</textarea></label>
      <label class="wide">부수 항목<textarea data-panel-field="subItems">${escapeXml(row.subItems)}</textarea></label>
      <label class="wide">줄이는 분쟁<textarea data-panel-field="disputeReduced">${escapeXml(row.disputeReduced)}</textarea></label>
    </div>
  `;
}

function renderReflectionMap() {
  const row = selectedEstimateRow();
  if (!row) {
    els.reflectionMap.innerHTML = "";
    return;
  }
  const targets = [
    ["03_SW_개발용역계약서_초안.docx", "제4조 견적 row 기준 과업 범위"],
    ["02_RFP_과업내용서.docx", "견적 row 기반 과업 범위"],
    ["04_검수기준표.docx", "견적 row 테스트 조건"],
    ["10_대금_마일스톤_지급표.docx", "견적 row 금액"],
    ["15_견적산정표.docx", "견적 row 전체"],
    ["06_변경요청서.docx", "기준 견적 row"],
  ];
  els.reflectionMap.innerHTML = `<div class="reflection-list">${targets
    .map(
      ([doc, section]) => `
        <article class="reflection-item">
          <strong>${doc}</strong>
          <span>${section}</span>
          <span>반영 ID: ${row.id}</span>
        </article>
      `,
    )
    .join("")}</div>`;
}

function renderOverlayList() {
  els.overlayList.innerHTML = overlayItems
    .map(
      (item) => `
        <article class="overlay-item">
          <strong>${item.field}</strong>
          <span>${item.memo}</span>
          <span>줄이는 분쟁: ${item.dispute}</span>
          <span>반영 문서: ${item.reflected}</span>
        </article>
      `,
    )
    .join("");
}

function renderWriterChecks() {
  const checks = [
    {
      ok: estimateRows.length > 0,
      label: "견적 row가 1개 이상 있음",
      action: "add-row",
    },
    {
      ok: estimateRows.every((row) => row.requirement.trim()),
      label: "모든 row가 기능 ID 또는 작업 묶음과 연결됨",
      field: "requirement",
    },
    {
      ok: estimateRows.every((row) => row.preconditions.trim()),
      label: "모든 row에 전제조건이 있음",
      field: "preconditions",
    },
    {
      ok: estimateRows.every((row) => row.completionCondition.trim()),
      label: "모든 row에 완수 조건이 있음",
      field: "completionCondition",
    },
    {
      ok: estimateRows.every((row) => row.testCondition.trim()),
      label: "모든 row에 테스트 조건이 있음",
      field: "testCondition",
    },
    {
      ok: estimateRows.every((row) => row.subItems.trim()),
      label: "모든 row에 부수 항목이 있음",
      field: "subItems",
    },
  ];

  els.writerChecks.innerHTML = checks
    .map((check) => {
      const actionAttrs = check.action
        ? `data-fix-action="${check.action}"`
        : `data-fix-field="${check.field}"`;
      return `
        <article class="writer-check ${check.ok ? "ok-state" : "warn-state"}">
          <strong>${check.ok ? "완료" : "확인 필요"}</strong>
          <span>${check.label}</span>
          ${check.ok ? "" : `<button class="fix-button" type="button" ${actionAttrs}>수정</button>`}
        </article>
      `;
    })
    .join("");
}

function focusPanelField(field) {
  const missingIndex = estimateRows.findIndex((row) => !String(row[field] || "").trim());
  if (missingIndex >= 0) selectEstimateRow(missingIndex);
  requestAnimationFrame(() => {
    const target = els.selectedRowEditor.querySelector(`[data-panel-field="${field}"]`);
    target?.focus();
  });
}

function selectEstimateRow(index) {
  selectedEstimateIndex = Math.max(0, Math.min(index, estimateRows.length - 1));
  renderEstimateRows();
  renderSelectedRowEditor();
  renderReflectionMap();
  trackEvent("estimate_row_selected", { rowId: selectedEstimateRow()?.id });
}

function syncEstimateField(target) {
  const rowEl = target.closest("[data-estimate-index]");
  if (!rowEl) return;
  const row = estimateRows[Number(rowEl.dataset.estimateIndex)];
  const field = target.dataset.estimateField;
  if (!row || !field) return;
  if (field === "quantity" || field === "unitPrice") {
    row[field] = Number(target.value || 0);
  } else {
    row[field] = target.value;
  }
  const moneyCell = rowEl.querySelector(".money-cell");
  if (moneyCell) moneyCell.textContent = formatMoney(rowAmount(row));
  els.estimateTotal.textContent = `합계 ${formatMoney(estimateTotal())}`;
  renderWriterChecks();
  if (Number(rowEl.dataset.estimateIndex) === selectedEstimateIndex) {
    renderSelectedRowEditor();
    renderReflectionMap();
  }
  trackEvent("estimate_row_updated", { rowId: row.id, field });
  updateRfp();
}

function syncPanelField(target) {
  const row = selectedEstimateRow();
  if (!row) return;
  const field = target.dataset.panelField;
  if (field === "quantity" || field === "unitPrice") {
    row[field] = Number(target.value || 0);
  } else {
    row[field] = target.value;
  }
  renderEstimateRows();
  const amount = els.selectedRowEditor.querySelector("[data-panel-amount]");
  if (amount) amount.value = formatMoney(rowAmount(row));
  renderWriterChecks();
  renderReflectionMap();
  trackEvent("estimate_row_updated", { rowId: row.id, field, source: "panel" });
  updateRfp();
}

function addEstimateRow() {
  const next = estimateRows.length + 1;
  estimateRows.push({
    id: `EST-${String(next).padStart(3, "0")}`,
    item: "새 작업 항목",
    requirement: "",
    unit: "일",
    quantity: 1,
    unitPrice: 800000,
    preconditions: "",
    completionCondition: "",
    testCondition: "",
    subItems: "",
    disputeReduced: "",
  });
  selectedEstimateIndex = estimateRows.length - 1;
  renderEstimateRows();
  renderSelectedRowEditor();
  renderReflectionMap();
  renderWriterChecks();
  trackEvent("estimate_row_added", { rowId: selectedEstimateRow()?.id });
  updateRfp();
}

function exportEstimateRowsJson() {
  const payload = {
    schema: "scopeguard.estimateRows.v1",
    exportedAt: new Date().toISOString(),
    project: projectMeta(),
    appendices: appendixSelections(),
    rows: estimateRows,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  saveBlob(`${sanitizeFilePart(payload.project.projectName)}_estimate_rows.json`, blob);
  trackEvent("estimate_rows_exported", { rowCount: estimateRows.length });
}

async function importEstimateRowsJson(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const rows = Array.isArray(data)
    ? data
    : data.rows || data.estimateRows || data.estimate?.rows;
  if (!Array.isArray(rows)) throw new Error("견적 row 배열을 찾을 수 없습니다.");
  if (data.appendices && typeof data.appendices === "object") {
    if (els.appendixDesignUx) els.appendixDesignUx.checked = Boolean(data.appendices.designUx);
    if (els.appendixRevisionCounting) {
      els.appendixRevisionCounting.checked = Boolean(data.appendices.revisionCounting);
    }
  }
  estimateRows = rows.map((row, index) => ({
    id: row.id || `EST-${String(index + 1).padStart(3, "0")}`,
    item: row.item || "",
    requirement: row.requirement || row.linkedRequirementIds?.join(", ") || "",
    unit: row.unit || "일",
    quantity: Number(row.quantity || 0),
    unitPrice: Number(row.unitPrice || 0),
    preconditions: row.preconditions || row.assumption || "",
    completionCondition: row.completionCondition || "",
    testCondition: row.testCondition || "",
    subItems: Array.isArray(row.subItems) ? row.subItems.join(", ") : row.subItems || "",
    disputeReduced: row.disputeReduced || "",
  }));
  selectedEstimateIndex = 0;
  renderEstimateRows();
  renderSelectedRowEditor();
  renderReflectionMap();
  renderWriterChecks();
  trackEvent("estimate_rows_imported", { rowCount: estimateRows.length });
  updateRfp();
}

function roleClause() {
  if (currentRole === "buyer") {
    return "본 초안은 발주자가 원하는 결과물, 검수 기준, 납품물 인도 범위를 명확히 하기 위한 발주자 중심 초안이다.";
  }
  if (currentRole === "supplier") {
    return "본 초안은 수급자가 부담하는 개발 범위, 무상수정, 변경요청, 일정연장 기준을 명확히 하기 위한 수급자 중심 초안이다.";
  }
  return "본 초안은 발주자와 수급자가 과업범위, 검수, 수정, 변경요청 기준을 균형 있게 합의하기 위한 중립 초안이다.";
}

function buildContractDraft() {
  const checks = checkedMap();
  const missing = rfpItems.filter((item) => !checks[item.id]);
  const done = rfpItems.filter((item) => checks[item.id]);
  const projectName = els.projectName.value.trim() || "미정 프로젝트";
  const buyerName = els.buyerName.value.trim() || "발주자";
  const supplierName = els.supplierName.value.trim() || "수급자";
  const brief = els.brief.value.trim() || "요구사항 미입력";

  return `# ${projectName} SW 개발용역계약서 초안

> 작성 관점: ${roleLabel()}
> 주의: 본 문서는 계약서 작성 보조 초안이며, 실제 체결 전 변호사 검토가 필요합니다.

## 제1조 목적

${buyerName}은 ${supplierName}에게 아래 소프트웨어 개발용역을 의뢰하고, ${supplierName}은 본 계약에서 정한 과업 범위, 검수 기준, 수정 및 변경요청 절차에 따라 산출물을 제공한다.

${roleClause()}

## 제2조 프로젝트 개요

- 프로젝트명: ${projectName}
- 계약 유형: ${els.contractType.options[els.contractType.selectedIndex].text}
- 발주자: ${buyerName}
- 수급자: ${supplierName}
- 요구사항 요약: ${brief}
- 견적 row 합계: ${formatMoney(estimateTotal())}

## 제3조 착수자료 및 과업 범위

수급자는 PRD, 기능정의서, 화면설계서, 사용자 흐름, 콘텐츠, 데이터/API 정보, 검수 기준 등 개발에 필요한 자료가 서면으로 확정된 기능에 한하여 개발 착수 의무를 부담한다.

현재 준비 완료된 자료:

${done.length ? done.map((item) => `- ${item.label}`).join("\n") : "- 없음"}

착수 전 보완이 필요한 자료:

${missing.map((item) => `- ${item.label}: ${item.prompt}`).join("\n")}

자료 미제공, 불명확한 요구사항, 승인 지연 또는 발주자의 변경 요청으로 개발이 지연되는 경우 납품일 및 검수 일정은 해당 지연 기간만큼 자동 연장된다.

## 제4조 견적 row 기준 과업 범위

수급자의 과업 범위는 아래 견적 row의 항목, 전제조건, 완수 조건, 테스트 조건 및 부수 항목으로 한정한다. 각 row에 없는 세부 작업은 별도 row 또는 변경요청으로 처리한다.

${markdownTable(
  ["ID", "항목", "연결 기능", "금액", "전제조건", "완수 조건", "테스트 조건", "부수 항목"],
  estimateRows.map((row) => [
    row.id,
    row.item,
    row.requirement,
    formatMoney(rowAmount(row)),
    row.preconditions,
    row.completionCondition,
    row.testCondition,
    row.subItems,
  ]),
)}

## 제5조 검수

발주자는 산출물 제출일로부터 5영업일 이내에 기능별 검수 기준과 견적 row의 테스트 조건에 따라 합격 또는 반려 여부를 서면으로 통지한다. 기한 내 구체적인 반려 사유를 서면 제출하지 않는 경우 해당 산출물은 승인된 것으로 본다.

## 제6조 하자와 수정

계약 범위에 명시된 기능이 작동하지 않거나 재현 가능한 오류로 검수 기준을 충족하지 못하는 경우 하자로 본다. 하자 보완은 무상수정 횟수에 산입하지 않는다.

${revisionText()} 수정 1회는 산출물 제출 후 5영업일 이내 발주자가 서면 제출한 통합 수정요청 1세트를 의미한다.

## 제7조 변경요청

신규 기능, 신규 화면, 데이터 구조 변경, 외부 연동 추가, 운영 정책 변경, 승인된 PRD 또는 화면설계서 변경은 변경요청으로 처리한다. 변경요청은 비용과 일정에 대한 서면 합의 후 수행한다. 비용 산정은 기존 견적 row 또는 별도 변경요청 row를 기준으로 한다.

## 제8조 회의 및 커뮤니케이션

${meetingText()} 추가 대면회의, 현장 방문, 교육, 워크숍, 시연회는 별도 유상 지원으로 한다.

회의에서 논의된 사항은 회의록으로 등록되고 양 당사자가 승인한 경우에만 계약상 확정사항으로 본다.

${optionalAppendixContractSection()}
`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphXml(text, style = "Normal") {
  const pStyle = style === "Normal" ? "" : `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`;
  return `<w:p>${pStyle}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function isMarkdownTableLine(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function parseMarkdownTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/<br>/g, "\n"));
}

function isMarkdownSeparator(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function wordTableXml(headers, rows) {
  const cell = (value, header = false) => {
    const shading = header ? '<w:shd w:fill="EAF1F8"/>' : "";
    const bold = header ? "<w:b/>" : "";
    return `<w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/>${shading}</w:tcPr><w:p><w:r><w:rPr>${bold}</w:rPr><w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r></w:p></w:tc>`;
  };
  const headerRow = `<w:tr>${headers.map((item) => cell(item, true)).join("")}</w:tr>`;
  const bodyRows = rows
    .map((row) => `<w:tr>${row.map((item) => cell(item)).join("")}</w:tr>`)
    .join("");
  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="0" w:type="auto"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:left w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:bottom w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:right w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:insideH w:val="single" w:sz="4" w:color="B7C2D0"/>
        <w:insideV w:val="single" w:sz="4" w:color="B7C2D0"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="100" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    ${headerRow}${bodyRows}
  </w:tbl><w:p/>`;
}

function markdownToWordParagraphs(markdown) {
  const lines = markdown.split(/\r?\n/);
  const paragraphs = [];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trimEnd();
    if (isMarkdownTableLine(line)) {
      const headers = parseMarkdownTableRow(line);
      const maybeSeparator = parseMarkdownTableRow(lines[index + 1] || "");
      if (isMarkdownSeparator(maybeSeparator)) {
        index += 2;
        const rows = [];
        while (index < lines.length && isMarkdownTableLine(lines[index])) {
          rows.push(parseMarkdownTableRow(lines[index]));
          index += 1;
        }
        index -= 1;
        paragraphs.push(wordTableXml(headers, rows));
        continue;
      }
    }
    if (!line.trim()) {
      paragraphs.push("<w:p/>");
      continue;
    }
    if (line.startsWith("# ")) {
      paragraphs.push(paragraphXml(line.slice(2), "Title"));
    } else if (line.startsWith("## ")) {
      paragraphs.push(paragraphXml(line.slice(3), "Heading1"));
    } else if (line.startsWith("### ")) {
      paragraphs.push(paragraphXml(line.slice(4), "Heading2"));
    } else if (line.startsWith("- ")) {
      paragraphs.push(paragraphXml(`- ${line.slice(2)}`));
    } else if (line.startsWith("> ")) {
      paragraphs.push(paragraphXml(line.slice(2), "Quote"));
    } else {
      paragraphs.push(paragraphXml(line));
    }
  }

  return paragraphs.join("");
}

function contentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="21"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:after="260"/></w:pPr>
    <w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="34"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="260" w:after="140"/></w:pPr>
    <w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="27"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="200" w:after="100"/></w:pPr>
    <w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Malgun Gothic"/><w:sz w:val="23"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Quote">
    <w:name w:val="Quote"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:ind w:left="360"/><w:spacing w:before="80" w:after="80"/></w:pPr>
    <w:rPr><w:i/><w:color w:val="5C667A"/></w:rPr>
  </w:style>
</w:styles>`;
}

async function createDocxBlob(markdown) {
  if (!window.JSZip) {
    throw new Error("JSZip 로드 실패");
  }
  const zip = new window.JSZip();
  const body = markdownToWordParagraphs(markdown);
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file("[Content_Types].xml", contentTypesXml());
  zip.folder("_rels").file(".rels", rootRelsXml());
  zip.folder("word").file("document.xml", documentXml);
  zip.folder("word").file("styles.xml", stylesXml());
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

function renderFallbackPreview(target, markdown) {
  const lines = markdown.split(/\r?\n/);
  const chunks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isMarkdownTableLine(line)) {
      const headers = parseMarkdownTableRow(line);
      const maybeSeparator = parseMarkdownTableRow(lines[index + 1] || "");
      if (isMarkdownSeparator(maybeSeparator)) {
        index += 2;
        const rows = [];
        while (index < lines.length && isMarkdownTableLine(lines[index])) {
          rows.push(parseMarkdownTableRow(lines[index]));
          index += 1;
        }
        index -= 1;
        chunks.push(`<table><thead><tr>${headers.map((cell) => `<th>${escapeXml(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
        continue;
      }
    }
    if (line.startsWith("# ")) chunks.push(`<h1>${escapeXml(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) chunks.push(`<h2>${escapeXml(line.slice(3))}</h2>`);
    else if (line.startsWith("### ")) chunks.push(`<h3>${escapeXml(line.slice(4))}</h3>`);
    else if (!line.trim()) chunks.push("<p></p>");
    else chunks.push(`<p class="${line.startsWith("> ") ? "muted-line" : ""}">${escapeXml(line.replace(/^> /, ""))}</p>`);
  }
  target.innerHTML = `<article class="docx-fallback-page">${chunks.join("")}</article>`;
}

async function renderDocxPreview(target, markdown) {
  const token = (previewTokens.get(target) || 0) + 1;
  previewTokens.set(target, token);
  try {
    const blob = await createDocxBlob(markdown);
    if (token !== previewTokens.get(target)) return;
    target.innerHTML = "";
    if (window.docx?.renderAsync) {
      await window.docx.renderAsync(blob, target, null, {
        breakPages: true,
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
      });
    } else {
      renderFallbackPreview(target, markdown);
    }
  } catch {
    if (token === previewTokens.get(target)) renderFallbackPreview(target, markdown);
  }
}

function updateRfp() {
  contractMarkdown = buildContractDraft();
  renderOptionalFiles();
  renderDocxPreview(els.rfpOutput, contractMarkdown);
  renderDocxPreview(els.buyerEstimateOutput, buildBuyerEstimateMarkdown());
}

function buildAgreementMarkdown() {
  return `# 공급자/수요자 합의 옵션표

${agreementOptions
  .map(
    (option) => `## ${option.item}

- 수요자 이점: ${option.demand}
- 공급자 이점: ${option.supply}
- 권장 합의안: ${option.balanced}
`,
  )
  .join("\n")}
`;
}

function projectMeta() {
  return {
    projectName: els.projectName.value.trim() || "미정 프로젝트",
    buyerName: els.buyerName.value.trim() || "발주자",
    supplierName: els.supplierName.value.trim() || "수급자",
    contractType: els.contractType.options[els.contractType.selectedIndex].text,
    brief: els.brief.value.trim() || "요구사항 미입력",
  };
}

function sanitizeFilePart(value) {
  return String(value)
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 48) || "scopeguard";
}

function buildRfpSpecMarkdown() {
  const meta = projectMeta();
  const checks = checkedMap();
  const missing = rfpItems.filter((item) => !checks[item.id]);

  return `# ${meta.projectName} RFP 및 과업내용서 초안

> 작성 관점: ${roleLabel()}
> 기준: 소프트웨어사업 계약 및 관리감독에 관한 지침의 상세 요구사항 분류를 민간 SW 용역에 맞게 축약한 초안입니다.

## 1. 사업 개요

- 프로젝트명: ${meta.projectName}
- 발주자: ${meta.buyerName}
- 수급자: ${meta.supplierName}
- 계약 유형: ${meta.contractType}
- 목적: ${meta.brief}

## 2. 요구사항 분류

아래 항목은 SW사업 RFP의 상세 요구사항 분류를 민간 외주개발 계약에 맞게 줄인 기준입니다.

- 기능 요구사항: 사용자가 반드시 수행할 수 있어야 하는 기능, 권한, 예외조건
- 성능 요구사항: 응답시간, 처리량, 동시 사용자, 배치 처리 기준
- 인터페이스 요구사항: 화면, 사용자 흐름, 외부 API, 관리자 기능
- 데이터 요구사항: DB 항목, 초기 데이터, 마이그레이션, 보관·삭제 기준
- 테스트 요구사항: 기능별 합격 기준, 재현 절차, 테스트 계정
- 보안 요구사항: 로그인, 권한, 개인정보, 접근권한 회수, 로그
- 품질 요구사항: 신뢰성, 사용성, 유지관리성, 이식성, 보안성
- 프로젝트 관리 요구사항: 일정, 보고, 회의, 의사결정 기록
- 프로젝트 지원 요구사항: 운영 인수인계, 교육, 하자보수, 유지관리

## 3. 착수 전 필수 보완

${missing.length ? missing.map((item) => `- ${item.label}: ${item.prompt}`).join("\n") : "- 현재 입력값 기준 큰 누락 없음"}

## 4. 착수 원칙

PRD, 기능정의서, 화면설계서, 사용자 흐름, 디자인 기준, 콘텐츠·문구, 데이터/API 정보, 검수기준이 확정된 기능부터 착수합니다.

확정되지 않은 기능은 일정 산정과 개발 착수 대상에서 제외하거나, 기능별·마일스톤별 확정 후 착수합니다.

## 5. 견적 row 기반 과업 범위

${markdownTable(
  ["ID", "항목", "연결 기능", "금액", "전제조건", "완수 조건", "테스트 조건", "부수 항목"],
  estimateRows.map((row) => [
    row.id,
    row.item,
    row.requirement,
    formatMoney(rowAmount(row)),
    row.preconditions,
    row.completionCondition,
    row.testCondition,
    row.subItems,
  ]),
)}

## 6. 변경 관리

승인된 요구사항의 변경, 신규 기능, 신규 화면, 데이터 구조 변경, 외부 연동 추가, 운영정책 변경은 변경요청서로 처리합니다.

변경요청은 작업내용, 예상 비용, 일정 영향, 검수 기준을 서면으로 합의한 뒤 착수합니다.
`;
}

function screenUxAcceptanceMarkdown() {
  if (appendixSelections().designUx) {
    return `### 화면 및 UX

- 승인된 화면설계서 또는 Figma의 화면 목록, 레이아웃, 필수 상태를 충족합니다.
- 색상, 라운딩, 간격 등 선호 변경은 선택 별첨의 분류 기준에 따릅니다.
- 화면 구조, 정보구조, 플로우 변경은 변경요청입니다.`;
  }
  return `### 화면

- 화면설계서 또는 Figma가 제공된 경우 해당 화면 목록, 레이아웃, 필수 상태를 기준으로 확인합니다.
- 디자인/UX 선호 변경 분류는 선택 별첨을 포함한 경우에만 계약 기준으로 적용합니다.`;
}

function buildAcceptanceCriteriaMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 검수기준표

> 목적: "완료"의 정의를 기능별로 고정하여 하자, 무상수정, 변경요청을 분리합니다.

## 1. 검수 절차

- 수급자는 산출물, 배포 URL 또는 설치 파일, 테스트 계정, 릴리스 노트, 알려진 제한사항을 제출합니다.
- 발주자는 제출일로부터 5영업일 이내 검수 결과를 서면 통지합니다.
- 반려 시 요구사항 ID, 재현 절차, 기대 결과, 실제 결과, 첨부 증거를 함께 제출합니다.
- 기한 내 구체적 반려 사유가 없으면 해당 산출물은 승인된 것으로 봅니다.

## 2. 기능별 완료 정의

${markdownTable(
  ["ID", "항목", "연결 기능", "완수 조건", "테스트 조건", "부수 항목"],
  estimateRows.map((row) => [
    row.id,
    row.item,
    row.requirement,
    row.completionCondition,
    row.testCondition,
    row.subItems,
  ]),
)}

### 기능 요구사항

- 요구사항 ID가 부여되어 있습니다.
- 입력, 처리, 출력, 권한, 예외조건이 기능정의서와 일치합니다.
- 주요 사용자 시나리오가 중단 없이 수행됩니다.

${screenUxAcceptanceMarkdown()}

### 데이터/API

- 필수 필드, 저장 조건, 조회 조건, 삭제 조건이 정의되어 있습니다.
- 외부 API 키, 계정, 비용 부담 주체가 명확합니다.
- 마이그레이션 또는 초기 데이터 입력 범위가 확정되어 있습니다.

### 보안/개인정보

- 역할별 권한이 검증됩니다.
- 관리자 계정, 테스트 계정, API 키 인도 및 회수 기준이 있습니다.
- 개인정보 처리·위탁이 있으면 별도 동의와 보안 요구사항을 둡니다.

### 하자 판단

- 계약 범위 기능이 작동하지 않거나 검수기준을 충족하지 못하는 재현 가능한 오류는 하자입니다.
- 하자 보완은 무상수정 횟수에 산입하지 않습니다.
- 승인된 기획·디자인·정책의 변경은 하자가 아니라 수정 또는 변경요청입니다.
`;
}

function buildRevisionRequestMarkdown() {
  const meta = projectMeta();
  const counting = appendixSelections().revisionCounting
    ? `
## 수정횟수 산정 기준

${markdownTable(["상황", "산정", "메모"], revisionCountingRows)}
`
    : "";
  return `# ${meta.projectName} 수정요청서

## 제출 기준

- 수정요청 제출 기한: 산출물 제출 후 5영업일 이내
- 수정 1회 기준: 통합 수정요청 1세트
${appendixSelections().revisionCounting ? "- 세부 산정은 선택 별첨의 수정횟수 산정표를 따름" : "- 세부 산정 기준은 필요한 경우 선택 별첨으로 추가"}

## 수정요청 목록

### 요청 1

- 대상 화면/기능:
- 현재 상태:
- 요청 내용:
- 첨부 자료:
- 분류: 문구 / 이미지 / 색상 / 라운딩 / 간격 / 배치 / 표시 오류 / 기타

## 확인 문구

본 수정요청서는 계약 범위 내 경미한 수정 요청을 통합 제출하기 위한 문서입니다. 신규 기능, 신규 화면, 데이터 구조 변경, 운영정책 변경, 승인된 PRD 또는 화면설계서 변경은 변경요청서로 처리합니다.

${counting}
`;
}

function buildChangeRequestMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 변경요청서

## 변경 개요

- 요청자:
- 요청일:
- 기준 견적 row:
- 변경 대상 요구사항 ID:
- 변경 사유:

## 변경 내용

- 기존 합의 내용:
- 변경 요청 내용:
- 추가/변경 부수 항목:
- 신규 산출물:
- 검수 기준:

## 영향 평가

- 비용 영향:
- 일정 영향:
- 데이터/API 영향:
- 보안/개인정보 영향:
- 기존 기능 영향:

## 착수 조건

본 변경요청은 발주자와 수급자가 비용, 일정, 검수 기준을 서면 승인한 뒤 착수합니다. 승인 전에는 기존 계약 범위에 포함되지 않습니다.
`;
}

function buildMeetingMinutesMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 회의록 및 승인서

## 회의 정보

- 일시:
- 방식: 온라인 / 대면
- 참석자:
- 회의 목적:

## 논의 사항

- 안건 1:
- 결정 사항:
- 보류 사항:
- 담당자:
- 기한:

## 승인 기준

회의 중 구두로 논의된 사항은 본 회의록 또는 플랫폼 기록으로 등록되고 양 당사자가 승인한 경우에만 계약상 확정사항으로 봅니다.

회의록 승인 기한은 공유 후 2영업일입니다. 기한 내 이견이 없으면 회의록은 승인된 것으로 처리할 수 있습니다.
`;
}

function buildDeliveryConfirmationMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 납품확인서

## 납품 정보

- 납품일:
- 납품 버전:
- 배포 URL 또는 저장소:
- 테스트 계정:

## 납품물 목록

- 소스코드:
- 배포 환경 정보:
- DB 스키마:
- 관리자 계정:
- 운영 가이드:
- 오픈소스/외부 라이브러리 목록:

## 검수 연결

본 납품확인서는 산출물 제출 사실을 확인하는 문서이며, 최종 검수 합격 또는 하자 부존재를 의미하지 않습니다. 검수는 별도 검수기준표와 검수 결과 통지에 따릅니다.
`;
}

function buildDefectReportMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 하자신고서

## 하자 정보

- 신고일:
- 신고자:
- 대상 기능/요구사항 ID:
- 발생 환경:
- 심각도: 차단 / 높음 / 보통 / 낮음

## 재현 절차

1. 
2. 
3. 

## 기대 결과

-

## 실제 결과

-

## 첨부 증거

- 화면 캡처:
- 로그:
- 테스트 계정:

## 분류 기준

계약 범위 기능의 불능 또는 검수기준 미달은 하자입니다. 승인된 기획, 화면 구조, 데이터 구조, 운영정책의 변경은 하자가 아니라 수정요청 또는 변경요청으로 분류합니다.
`;
}

function buildEffectiveRiskMarkdown() {
  if (els.contractText.value.trim()) return riskMarkdown;
  const results = evaluateRisk(contractMarkdown);
  const triggered = results.filter((item) => item.triggered);
  const score = Math.min(100, triggered.reduce((sum, item) => sum + item.weight, 0));
  return buildRiskMarkdown(results, score);
}

function buildPaymentScheduleMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 대금 및 마일스톤 지급표

## 1. 지급 구조

- 계약금액: ${formatMoney(estimateTotal())}
- 선금:
- 중도금:
- 잔금:
- 세금계산서 발행일:
- 지급 기한:

## 2. 마일스톤

- 마일스톤 1: 착수자료 확정 / 지급률 / 검수 기준
- 마일스톤 2: 주요 기능 개발 완료 / 지급률 / 검수 기준
- 마일스톤 3: 최종 납품 / 지급률 / 검수 기준

## 3. 별도 비용

서버, 클라우드, AI API, 문자, 도메인, 외부 라이선스, 앱스토어 계정, 결제 수수료는 별도 비용으로 분리합니다.

## 4. 견적 row 금액

${markdownTable(
  ["ID", "항목", "연결 기능", "수량", "단위", "단가", "금액"],
  estimateRows.map((row) => [
    row.id,
    row.item,
    row.requirement,
    row.quantity,
    row.unit,
    formatMoney(row.unitPrice),
    formatMoney(rowAmount(row)),
  ]),
)}
`;
}

function buildBuyerEstimateMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 견적서

> 제출 대상: ${meta.buyerName}
> 작성자: ${meta.supplierName}
> 기준: 각 견적 row의 전제조건, 완수 조건, 테스트 조건, 부수 항목

## 1. 견적 요약

- 프로젝트명: ${meta.projectName}
- 계약 유형: ${meta.contractType}
- 견적 합계: ${formatMoney(estimateTotal())}
- 지급 조건: 계약서 및 대금/마일스톤 지급표 기준

## 2. 견적 상세

${markdownTable(
  ["ID", "항목", "연결 기능", "단위", "수량", "단가", "금액", "전제조건", "완수 조건", "테스트 조건", "부수 항목"],
  estimateRows.map((row) => [
    row.id,
    row.item,
    row.requirement,
    row.unit,
    row.quantity,
    formatMoney(row.unitPrice),
    formatMoney(rowAmount(row)),
    row.preconditions,
    row.completionCondition,
    row.testCondition,
    row.subItems,
  ]),
)}

## 3. 별도 협의 항목

- 위 row에 없는 신규 기능, 신규 화면, 데이터 구조 변경, 외부 연동 추가는 변경요청서 기준으로 별도 산정합니다.
- 발주자 제공 자료, 승인, 외부 계정/API 준비가 지연되는 경우 일정은 해당 기간만큼 조정됩니다.
`;
}

function buildEstimateSheetMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 견적 산정표

> 견적 row는 계약서 표를 자동 생성하는 기준입니다. 전제조건, 완수 조건, 테스트 조건, 부수 항목을 같이 적어야 계약 범위와 검수 기준이 같이 잠깁니다.

## 1. 견적 합계

- 합계: ${formatMoney(estimateTotal())}
- 기준: row별 단위, 수량, 단가 합산
- 별도 비용: 서버, API, 도메인, 외부 라이선스, 결제 수수료

## 2. 견적 row

${markdownTable(
  ["ID", "항목", "연결 기능", "단위", "수량", "단가", "금액", "전제조건", "완수 조건", "테스트 조건", "부수 항목", "줄이는 분쟁"],
  estimateMarkdownRows(),
)}

## 3. 변경요청 단가

${markdownTable(
  ["항목", "최소 단위", "기준"],
  [
    ["추가 기능 개발", "반일", "승인된 변경요청서 기준"],
    ["추가 대면회의", "반일", "포함 횟수 초과 시"],
    ["기존 row 변경", "row 재산정", "전제조건 또는 완수 조건 변경 시"],
  ],
)}
`;
}

function buildDesignUxAppendixMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 선택별첨 - 디자인/UX 수정 범위

> 이 별첨은 작성 화면에서 선택한 경우에만 계약문서 세트에 포함됩니다.

## 1. 목적

디자인 또는 UX에 관한 요청이 하자인지, 무상수정인지, 변경요청인지 분류하기 위한 기준입니다. 추상적 선호 표현만으로는 검수 반려 또는 하자 신고 사유가 되지 않으며, 확정된 화면설계서, Figma, 컴포넌트 기준, 레퍼런스 또는 견적 row의 완수 조건을 기준으로 판단합니다.

## 2. 사례별 분류표

${markdownTable(["요청 예시", "분류", "처리 기준", "필요 조치"], designUxRevisionCases)}

## 3. 입력해야 할 기준

- 화면 목록:
- 기준 디자인 파일 또는 링크:
- 컴포넌트 기준:
- 색상/폰트/간격/라운딩 기준:
- 반응형 기준:
- 디자인 검수 담당자:
- 승인 후 변경 시 처리 방식: 수정요청 / 변경요청 / 별도 합의
`;
}

function buildRevisionCountingAppendixMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 선택별첨 - 수정횟수 산정표

> 이 별첨은 작성 화면에서 선택한 경우에만 계약문서 세트에 포함됩니다.

## 1. 기본 원칙

- 수정 1회는 산출물 제출 후 정해진 기간 안에 서면으로 제출된 통합 수정요청 1세트입니다.
- 하자 보완은 무상수정 횟수에서 차감하지 않습니다.
- 승인된 기획, 화면, 디자인 방향, 데이터 구조, 운영 정책을 바꾸는 요청은 수정횟수 산정이 아니라 변경요청으로 처리합니다.

## 2. 산정표

${markdownTable(["상황", "산정", "메모"], revisionCountingRows)}

## 3. 요청서 작성 단위

- 대상 산출물:
- 제출 기한:
- 이번 요청 회차:
- 포함 요청 수:
- 하자 제외 항목:
- 변경요청 전환 항목:
- 양측 확인:
`;
}

function optionalAppendixDocuments() {
  const selected = appendixSelections();
  const docs = [];
  if (selected.designUx) {
    docs.push(["16_선택별첨_디자인_UX_수정범위.docx", buildDesignUxAppendixMarkdown()]);
  }
  if (selected.revisionCounting) {
    docs.push(["17_선택별첨_수정횟수_산정표.docx", buildRevisionCountingAppendixMarkdown()]);
  }
  return docs;
}

function buildRightsHandoverMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 권리귀속 및 소스코드 인도목록

## 1. 프로젝트 전용 산출물

- 프로젝트 전용 소스코드:
- 디자인 파일:
- 문서:
- 데이터베이스 스키마:
- 관리자 계정:

## 2. 수급자 사전보유자산

- 공통 모듈:
- 프레임워크:
- 자동화 스크립트:
- 템플릿:
- 개발도구 및 노하우:

## 3. 외부 자산

- 오픈소스 라이브러리:
- 상용 라이선스:
- 외부 API:
- 저작권 또는 라이선스 제한사항:
`;
}

function buildOpsHandoverMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 운영비/API/계정 인수인계서

## 1. 운영 비용

- 클라우드 비용 부담 주체:
- AI API 비용 부담 주체:
- 문자/이메일 발송 비용 부담 주체:
- 도메인/SSL 비용 부담 주체:
- 외부 SaaS/라이선스 비용 부담 주체:

## 2. 계정 인수인계

- 관리자 계정:
- 배포 계정:
- DB 계정:
- 외부 API 키:
- 권한 회수 및 폐기 일자:
`;
}

function buildPrivacySecurityMarkdown() {
  const meta = projectMeta();
  return `# ${meta.projectName} 개인정보 및 보안 요구사항

## 1. 개인정보 처리 여부

- 개인정보 처리 여부: 예 / 아니오
- 민감정보 처리 여부: 예 / 아니오
- 처리 목적:
- 처리 항목:
- 보존 기간:
- 파기 기준:

## 2. 접근통제

- 역할별 권한:
- 관리자 접근 범위:
- 로그 보관:
- 계정 회수:
- 테스트 데이터 비식별화:
`;
}

function buildDocumentBundle() {
  const meta = projectMeta();
  return [
    ["02_RFP_과업내용서.docx", buildRfpSpecMarkdown()],
    ["03_SW_개발용역계약서_초안.docx", contractMarkdown || buildContractDraft()],
    ["04_검수기준표.docx", buildAcceptanceCriteriaMarkdown()],
    ["05_수정요청서.docx", buildRevisionRequestMarkdown()],
    ["06_변경요청서.docx", buildChangeRequestMarkdown()],
    ["07_회의록_승인서.docx", buildMeetingMinutesMarkdown()],
    ["08_납품확인서.docx", buildDeliveryConfirmationMarkdown()],
    ["09_하자신고서.docx", buildDefectReportMarkdown()],
    ["10_대금_마일스톤_지급표.docx", buildPaymentScheduleMarkdown()],
    ["11_권리귀속_소스코드_인도목록.docx", buildRightsHandoverMarkdown()],
    ["12_운영비_API_계정_인수인계서.docx", buildOpsHandoverMarkdown()],
    ["13_개인정보_보안_요구사항.docx", buildPrivacySecurityMarkdown()],
    ["14_공급자_수요자_합의표.docx", buildAgreementMarkdown()],
    ["15_견적산정표.docx", buildEstimateSheetMarkdown()],
    ...optionalAppendixDocuments(),
    [
      "00_참고문헌.docx",
      `# ${meta.projectName} 참고문헌

${legalReferences.map((ref) => `## ${ref.title}\n\n- 용도: ${ref.note}\n- 링크: ${ref.url}`).join("\n\n")}
`,
    ],
  ];
}

function renderAgreement() {
  els.agreementTable.innerHTML = agreementOptions
    .map(
      (option) => `
      <article class="agreement-row">
        <div><strong>${option.item}</strong><span>합의 항목</span></div>
        <div><strong>수요자</strong><span>${option.demand}</span></div>
        <div><strong>공급자</strong><span>${option.supply}</span></div>
        <div><strong>균형안</strong><span>${option.balanced}</span></div>
      </article>
    `,
    )
    .join("");
}

function evaluateRisk(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const results = riskRules.map((rule) => {
    const matchedByHit = rule.hit ? rule.hit.test(normalized) : false;
    const matchedByMiss = rule.miss ? !rule.miss.test(normalized) : false;
    const triggered = matchedByHit || matchedByMiss;
    return { ...rule, triggered, matchedByHit, matchedByMiss };
  });
  return results;
}

function riskBand(score) {
  if (score >= 81) return "착수 비권장";
  if (score >= 61) return "고위험";
  if (score >= 31) return "보완 필요";
  if (score > 0) return "양호에 가까움";
  return "대기 중";
}

function buildRiskMarkdown(results, score) {
  const triggered = results.filter((item) => item.triggered);
  const ok = results.filter((item) => !item.triggered);

  return `# 계약 입력 점검 결과

## 총평

- 리스크 점수: ${score}
- 상태: ${riskBand(score)}
- 탐지된 리스크: ${triggered.length}개

## 탐지된 리스크

${
  triggered.length
    ? triggered
        .map(
          (item) =>
            `### ${item.title}

- 심각도: ${item.severity}
- 수정 제안: ${item.recommendation}
`,
        )
        .join("\n")
    : "- 현재 룰셋 기준으로 큰 리스크가 탐지되지 않았습니다."
}

## 확인된 항목

${ok.length ? ok.map((item) => `- ${item.title}`).join("\n") : "- 없음"}

## 참조 레퍼런스

${legalReferences.map((ref) => `- ${ref.title}: ${ref.url}`).join("\n")}

## 주의

이 문서는 법률 자문이 아니라 계약 운영 항목 점검 초안입니다.
`;
}

function updateRisk() {
  const text = els.contractText.value;
  if (!text.trim()) {
    els.riskScore.textContent = "0";
    els.riskBand.textContent = "대기 중";
    els.riskResults.innerHTML =
      '<article class="risk-item"><span class="badge ok">ready</span><div><strong>계약서 본문을 넣어주세요</strong><p>계약서 텍스트를 붙여넣거나 텍스트/Markdown 파일을 업로드하면 리스크를 검사합니다.</p></div></article>';
    riskMarkdown = `# 계약 입력 점검 결과

계약서 본문을 붙여넣으면 계약 입력 점검 결과가 생성됩니다.
`;
    renderDocxPreview(els.riskOutput, riskMarkdown);
    return;
  }

  const results = evaluateRisk(text);
  const triggered = results.filter((item) => item.triggered);
  const score = Math.min(
    100,
    triggered.reduce((sum, item) => sum + item.weight, 0),
  );

  els.riskScore.textContent = String(score);
  els.riskBand.textContent = riskBand(score);
  els.riskResults.innerHTML = results
    .filter((item) => item.triggered)
    .map(
      (item) => `
        <article class="risk-item">
          <span class="badge ${item.severity}">${item.severity}</span>
          <div>
            <strong>${item.title}</strong>
            <p>${item.recommendation}</p>
          </div>
        </article>
      `,
    )
    .join("");

  if (!triggered.length) {
    els.riskResults.innerHTML =
      '<article class="risk-item"><span class="badge ok">ok</span><div><strong>리스크 없음</strong><p>본문을 더 붙여넣거나 계약서 원문을 확인하세요.</p></div></article>';
  }

  riskMarkdown = buildRiskMarkdown(results, score);
  renderDocxPreview(els.riskOutput, riskMarkdown);
}

function saveBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function downloadDocx(filename, markdown) {
  const blob = await createDocxBlob(markdown);
  saveBlob(filename, blob);
}

async function downloadBundleZip() {
  if (!window.JSZip) throw new Error("JSZip 로드 실패");
  const meta = projectMeta();
  const zip = new window.JSZip();
  const documents = buildDocumentBundle();

  for (const [filename, markdown] of documents) {
    zip.file(filename, await createDocxBlob(markdown));
  }

  zip.file(
    "README.txt",
    [
      "scopeguard-kr SW 외주개발계약 계약문서 패키지",
      "",
      "이 패키지는 법률 자문이나 공증을 대체하지 않습니다.",
      "목적은 계약 전 과업 범위, 검수 기준, 수정/변경요청 기준을 계약 조항과 부속서류에 반영하는 것입니다.",
    ].join("\n"),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  saveBlob(`${sanitizeFilePart(meta.projectName)}_scopeguard_docs.zip`, blob);
}

function wireEvents() {
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => {
      currentRole = button.dataset.role;
      document
        .querySelectorAll("[data-role]")
        .forEach((item) => item.classList.toggle("active", item === button));
      trackEvent("role_selected", { role: currentRole });
      updateRfp();
    });
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-estimate-field]")) {
      syncEstimateField(event.target);
      return;
    }
    if (event.target.matches("[data-panel-field]")) {
      syncPanelField(event.target);
      return;
    }
    if (
      event.target.matches(
        "[data-check], #project-name, #buyer-name, #supplier-name, #contract-type, #revision-policy, #meeting-policy, #brief",
      )
    ) {
      updateRfp();
    }
    if (event.target.matches("#contract-text")) {
      updateRisk();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-estimate-field]")) {
      syncEstimateField(event.target);
      return;
    }
    if (event.target.matches("[data-panel-field]")) {
      syncPanelField(event.target);
      return;
    }
    if (event.target.matches("[data-appendix]")) {
      trackEvent("appendix_option_changed", {
        key: event.target.dataset.appendix,
        enabled: event.target.checked,
      });
      updateRfp();
    }
  });

  document.addEventListener("click", (event) => {
    const rowButton = event.target.closest("[data-select-estimate-row]");
    if (rowButton) {
      selectEstimateRow(Number(rowButton.dataset.selectEstimateRow));
      return;
    }
    const fixAction = event.target.closest("[data-fix-action]");
    if (fixAction?.dataset.fixAction === "add-row") {
      addEstimateRow();
      return;
    }
    const fixField = event.target.closest("[data-fix-field]");
    if (fixField) {
      focusPanelField(fixField.dataset.fixField);
    }
  });

  els.fileInput.addEventListener("change", async () => {
    const [file] = els.fileInput.files;
    if (!file) return;
    const text = await file.text();
    els.contractText.value = text;
    updateRisk();
  });

  els.downloadBundle.addEventListener("click", async () => {
    trackEvent("docx_bundle_downloaded", { rowCount: estimateRows.length });
    await downloadBundleZip();
  });

  els.downloadContract.addEventListener("click", async () => {
    trackEvent("contract_docx_downloaded", { rowCount: estimateRows.length });
    await downloadDocx("03_SW_개발용역계약서_초안.docx", contractMarkdown || buildContractDraft());
  });

  els.downloadAgreement.addEventListener("click", async () => {
    await downloadDocx("14_공급자_수요자_합의표.docx", buildAgreementMarkdown());
  });

  els.downloadRisk.addEventListener("click", async () => {
    await downloadDocx("web_계약리스크리포트.docx", buildEffectiveRiskMarkdown());
  });

  els.addEstimateRow.addEventListener("click", addEstimateRow);

  els.exportEstimateRows.addEventListener("click", exportEstimateRowsJson);
  els.importEstimateRows.addEventListener("click", () => els.importEstimateRowsFile.click());
  els.importEstimateRowsFile.addEventListener("change", async () => {
    const [file] = els.importEstimateRowsFile.files;
    if (!file) return;
    await importEstimateRowsJson(file);
    els.importEstimateRowsFile.value = "";
  });
}

renderChecks();
renderEstimateRows();
renderSelectedRowEditor();
renderReflectionMap();
renderOverlayList();
renderWriterChecks();
renderAgreement();
wireEvents();
updateRfp();
updateRisk();
