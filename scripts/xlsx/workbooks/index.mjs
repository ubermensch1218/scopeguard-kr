import { createHwpContext, designUxRevisionCases, revisionCountingRows, v } from "../../hwp/helpers.mjs";

const header = (...items) => items;
const row = (...items) => items.map((item) => v(item, ""));

function fieldRows(object, fields) {
  return [
    header("항목", "값"),
    ...fields.map(([label, value]) => row(label, value)),
  ];
}

function requirementRows(ctx) {
  return [
    header("요구사항 ID", "분류", "기능명", "설명", "검수 기준", "상태"),
    ...ctx.requirementRows(),
  ];
}

function estimateRows(ctx) {
  return [
    header("견적 ID", "분류", "항목", "연결 요구사항", "단위", "수량", "단가", "금액", "전제조건", "완수 조건", "테스트 조건", "부수 항목", "줄이는 분쟁"),
    ...ctx.estimateRows(),
  ];
}

function featureSpecs(input) {
  const explicitSpecs = input.featureSpecs || [];
  if (explicitSpecs.length) return explicitSpecs;
  return (input.requirements || []).map((req) => ({
    id: req.id,
    name: req.name || req.title,
    linkedRequirementIds: [req.id],
    linkedEstimateIds: [],
    entryPoints: [],
    actors: [],
    designRequirements: [],
    flow: "",
    finalScreens: [],
    finalResults: [req.acceptance],
    completionCondition: req.acceptance,
    testCondition: "",
    disputeReduced: "",
  }));
}

function featureSummaryRows(input) {
  return [
    header("기능 ID", "기능명", "연결 요구사항", "연결 견적 row", "진입점", "사용자/권한", "디자인 요건", "최종 화면", "최종 결과", "완료 기준", "테스트 조건", "줄이는 분쟁"),
    ...featureSpecs(input).map((spec) => row(
      spec.id,
      spec.name,
      spec.linkedRequirementIds,
      spec.linkedEstimateIds,
      spec.entryPoints,
      spec.actors,
      (spec.designRequirements || []).map((item) => typeof item === "string" ? item : `${v(item.name)}: ${v(item.status)} / ${v(item.criteria)}`),
      spec.finalScreens,
      spec.finalResults,
      spec.completionCondition,
      spec.testCondition,
      spec.disputeReduced,
    )),
  ];
}

function designFlowRows(input) {
  return [
    header("기능 ID", "Mermaid 원문", "SVG 첨부", "검토 메모"),
    ...featureSpecs(input).map((spec) => row(
      spec.id,
      spec.flow || "flowchart TD\n  A[진입점] --> B[사용자 입력]\n  B --> C{검증}\n  C -->|성공| D[최종 결과]\n  C -->|실패| E[오류/빈 상태]",
      spec.flowSvg || "필요 시 첨부",
      spec.flowMemo,
    )),
  ];
}

function startMaterialRows(input) {
  const materials = input.startMaterials || {};
  return [
    header("자료", "제공 상태", "확정일", "관련 기능/견적 ID", "미제공 영향", "확인"),
    ...Object.entries(materials).map(([name, status]) => row(name, status, "", "", "해당 기능 착수 보류 또는 일정 조정", "[ ]")),
  ];
}

function acceptanceRunRows(input) {
  return [
    header("테스트 ID", "요구사항 ID", "견적 ID", "기능/화면", "수행일", "수행자", "테스트 계정/환경", "기대 결과", "실제 결과", "결과", "증거 링크", "반려 사유", "재검수일"),
    ...(input.requirements || []).map((req, index) => row(
      `TEST-${String(index + 1).padStart(3, "0")}`,
      req.id,
      (input.estimate?.rows || []).filter((estimate) => (estimate.linkedRequirementIds || []).includes(req.id)).map((estimate) => estimate.id),
      req.name || req.title,
      "",
      "",
      "스테이징 / 운영 / 기기 / 브라우저",
      req.acceptance,
      "",
      "합격 / 반려 / 보류",
      "",
      "",
      "",
    )),
  ];
}

function riskReviewRows(input) {
  const riskRows = [
    ["착수자료 미확정", "PRD/기능정의/화면설계/검수기준 상태가 비어 있음", "중", "착수자료 확정표 작성 후 기능별 착수"],
    ["검수 기준 부재", "요구사항별 기대 결과와 테스트 조건이 없음", "상", "검수기준표와 검수실행 기록표 연결"],
    ["수정횟수 기준 모호", "수정 1회의 단위와 제출 기한이 없음", "상", "통합 수정요청 1세트 기준 명시"],
    ["변경요청 절차 부재", "신규 기능/화면/데이터 변경의 비용·일정 승인 조건이 없음", "상", "변경요청서 승인 후 착수"],
    ["회의 결정 효력 모호", "구두 요청과 회의록 승인 기준이 없음", "중", "회의록 승인서와 변경요청서 연결"],
    ["권리귀속 모호", "프로젝트 전용 산출물과 사전보유자산 구분이 없음", "중", "권리귀속 인도목록 작성"],
    ["NDA 범위 모호", "비밀정보, 사용목적, 접근자, 반환/삭제 기준이 없음", "상", "NDA/IP 집중 검토 항목 작성"],
    ["IP 사용범위 모호", "피드백, 공동개발 결과물, 포트폴리오 사용, 침해 주장 대응 기준이 없음", "상", "권리귀속 인도목록과 전문가 검토 회수표 연결"],
  ];
  return [
    header("리스크 ID", "항목", "탐지 기준", "위험도", "추천 보완", "관련 문서", "처리 상태"),
    ...riskRows.map((item, index) => row(`RISK-${String(index + 1).padStart(3, "0")}`, ...item, "계약서 / 부속서류", "미처리 / 처리 / 제외")),
  ];
}

function expertReviewRows() {
  return [
    header("검토 ID", "대상 문서", "대상 조항/표 항목", "위험도", "문제", "제안 문구", "반드시 지킬 선", "양보 가능 조건", "처리 상태"),
    row("LEGAL-001", "계약서", "검수/반려/승인간주", "상 / 중 / 하", "", "", "", "", "미요청 / 요청 / 반영 / 보류"),
    row("LEGAL-002", "계약서", "하자/무상수정/변경요청", "상 / 중 / 하", "", "", "", "", "미요청 / 요청 / 반영 / 보류"),
    row("LEGAL-003", "권리귀속/소스코드 인도목록", "사전보유자산/오픈소스/외부 API", "상 / 중 / 하", "", "", "", "", "미요청 / 요청 / 반영 / 보류"),
    row("LEGAL-004", "개인정보/보안 요구사항", "위탁/재위탁/삭제/반환", "상 / 중 / 하", "", "", "", "", "미요청 / 요청 / 반영 / 보류"),
    row("LEGAL-005", "대금 마일스톤 지급표", "지급기한/중도해지/정산", "상 / 중 / 하", "", "", "", "", "미요청 / 요청 / 반영 / 보류"),
    row("LEGAL-006", "NDA/비밀유지계약", "비밀정보/사용목적/접근자/반환/삭제", "상 / 중 / 하", "", "", "", "", "미요청 / 요청 / 반영 / 보류"),
    row("LEGAL-007", "IP/라이선스 계약", "피드백/공동개발/사전보유자산/포트폴리오", "상 / 중 / 하", "", "", "", "", "미요청 / 요청 / 반영 / 보류"),
  ];
}

export function buildWorkbooks(input) {
  const ctx = createHwpContext(input);
  const optional = ctx.optionalAppendices;
  const workbooks = [
    {
      file: "01_입력값_요약표.xlsx",
      sheets: [
        { name: "핵심 운영 조건", rows: fieldRows(input, [
          ["프로젝트명", ctx.projectName],
          ["발주자", ctx.buyer],
          ["수급자", ctx.supplier],
          ["계약 유형", input.project?.type],
          ["견적 row 수", input.estimate?.rows?.length || 0],
          ["검수 기간", input.acceptance?.days],
          ["무상수정", input.revisions?.included],
          ["변경요청 착수 조건", input.changeRequests?.startCondition],
        ]) },
        { name: "요구사항", rows: requirementRows(ctx) },
        { name: "견적 row", rows: estimateRows(ctx) },
      ],
    },
    {
      file: "04_검수기준표.xlsx",
      sheets: [
        { name: "검수 기준", rows: requirementRows(ctx) },
        { name: "견적 row 테스트 조건", rows: [
          header("견적 ID", "항목", "연결 요구사항", "완수 조건", "테스트 조건", "확인"),
          ...ctx.estimateScopeRows().map((item) => row(item[0], item[1], item[2], item[4], item[5], "[ ]")),
        ] },
      ],
    },
    {
      file: "05_수정요청서.xlsx",
      sheets: [
        { name: "수정 요청 항목", rows: [
          header("번호", "대상 화면/기능", "관련 요구사항/견적 ID", "현재 상태", "요청 내용", "분류", "기대 반영 결과", "첨부 자료", "처리 결과"),
          row("1", "", "", "", "", "문구 / 이미지 / 색상 / 라운딩 / 간격 / 배치 / 표시 오류 / 검수미달 / 기타", "", "", "접수 / 반려 / 변경요청 전환 / 보류"),
        ] },
        { name: "수정횟수 산정 기준", rows: [header("상황", "산정", "메모"), ...revisionCountingRows] },
      ],
    },
    {
      file: "06_변경요청서.xlsx",
      sheets: [
        { name: "변경 요청", rows: [
          header("항목", "기존 합의 내용", "변경 요청 내용", "추가/변경 부수 항목", "검수 기준 변경", "비용 영향", "일정 영향", "승인"),
          row("기능", "", "", "", "", "", "", "[ ]"),
          row("화면", "", "", "", "", "", "", "[ ]"),
          row("데이터/API", "", "", "", "", "", "", "[ ]"),
          row("디자인/UX", "", "", "", "", "", "", "[ ]"),
          row("운영/정책", "", "", "", "", "", "", "[ ]"),
        ] },
        { name: "기준 견적 row", rows: estimateRows(ctx) },
      ],
    },
    {
      file: "07_회의록_승인서.xlsx",
      sheets: [
        { name: "회의 정보", rows: fieldRows(input, [
          ["온라인 정례", input.meetings?.onlineCadence],
          ["포함 대면회의", input.meetings?.onsiteIncluded],
          ["초과 대면회의", input.meetings?.extraOnsiteBilling],
          ["구두 요청 효력", input.meetings?.verbalRequestEffect],
          ["승인 기준", input.meetings?.minutesApproval],
        ]) },
        { name: "결정 사항", rows: [
          header("번호", "결정 내용", "계약 영향", "변경요청 여부", "근거 문서", "담당", "기한"),
          row("1", "", "없음 / 일정 / 비용 / 범위 / 검수 기준", "예 / 아니오", "", "", ""),
        ] },
      ],
    },
    {
      file: "08_납품확인서.xlsx",
      sheets: [
        { name: "납품 범위", rows: [
          header("견적 ID", "항목", "연결 요구사항", "완수 조건", "테스트 조건", "납품 상태"),
          ...ctx.estimateScopeRows().map((item) => row(item[0], item[1], item[2], item[4], item[5], "납품 완료 / 검수 대기 / 조건부 / 제외")),
        ] },
        { name: "산출물 인도 목록", rows: [
          header("산출물", "내용", "확인"),
          row("소스코드", input.deliverables?.sourceCode, "[ ]"),
          row("DB 스키마/마이그레이션", input.deliverables?.dbSchema, "[ ]"),
          row("관리자/테스트 계정", input.deliverables?.adminAccount, "[ ]"),
          row("운영 가이드", input.deliverables?.operationGuide, "[ ]"),
          row("검수 재현 절차", "", "[ ]"),
        ] },
      ],
    },
    {
      file: "09_하자신고서.xlsx",
      sheets: [
        { name: "하자 신고", rows: [
          header("신고일", "신고자", "대상 기능/요구사항 ID", "관련 견적 row", "발생 환경", "심각도", "재현 절차", "기대 결과", "실제 결과", "첨부 자료", "판정"),
          row("", "", "", "", "운영 / 스테이징 / 로컬 / 기기 / 브라우저 / OS", "차단 / 높음 / 보통 / 낮음", "", "", "", "", "하자 / 무상수정 / 변경요청 / 반려 / 보류"),
        ] },
        { name: "하자 성립 체크", rows: [
          header("체크", "기준", "메모"),
          row("[ ]", "계약 범위 또는 승인된 변경요청 범위에 포함됨", ""),
          row("[ ]", "검수기준표의 기대 결과와 연결됨", ""),
          row("[ ]", "재현 절차로 동일 현상을 확인할 수 있음", ""),
          row("[ ]", "UX 개선 또는 선호 변경이 아님", ""),
        ] },
      ],
    },
    {
      file: "10_대금_마일스톤_지급표.xlsx",
      sheets: [
        { name: "마일스톤", rows: [header("마일스톤", "기한", "산출물", "지급", "검수"), ...ctx.milestoneRows()] },
        { name: "견적 row 금액", rows: [header("견적 ID", "분류", "항목", "수량", "단위", "단가", "금액"), ...ctx.estimatePaymentRows()] },
      ],
    },
    {
      file: "14_공급자_수요자_합의표.xlsx",
      sheets: [
        { name: "합의 옵션", rows: [
          header("항목", "수요자 이점", "공급자 이점", "균형안", "선택"),
          row("검수 기간", "충분한 확인 시간", "무기한 지연 방지", input.acceptance?.days, "[ ]"),
          row("무상수정", "일정 범위 수정 가능", "총량 통제", input.revisions?.included, "[ ]"),
          row("변경요청", "범위 확장 가능", "비용·일정 재산정", input.changeRequests?.startCondition, "[ ]"),
          row("회의", "의사결정 참여", "초과 회의 통제", input.meetings?.extraOnsiteBilling, "[ ]"),
        ] },
      ],
    },
    {
      file: "15_견적산정표.xlsx",
      sheets: [
        { name: "견적 row", rows: estimateRows(ctx) },
        { name: "변경요청 단가", rows: [header("항목", "최소 단위", "단가", "기준"), ...ctx.changeRequestRateRows()] },
      ],
    },
    {
      file: "18_기능별_구현_디자인_명세서.xlsx",
      sheets: [
        { name: "기능별 요약", rows: featureSummaryRows(input) },
        { name: "디자인 플로우", rows: designFlowRows(input) },
        { name: "검수 연결", rows: [
          header("기능 ID", "화면/상태", "완료 기준", "테스트 조건", "분쟁 예방 메모"),
          ...featureSpecs(input).map((spec) => row(spec.id, spec.finalScreens, spec.completionCondition, spec.testCondition, spec.disputeReduced)),
        ] },
      ],
    },
    {
      file: "19_착수자료_확정표.xlsx",
      sheets: [
        { name: "착수자료 확정", rows: startMaterialRows(input) },
        { name: "기능별 착수 조건", rows: [
          header("기능 ID", "기능명", "필요 자료", "착수 가능 여부", "미비 자료", "일정 영향"),
          ...(input.requirements || []).map((req) => row(req.id, req.name || req.title, "PRD / 기능정의서 / 화면설계서 / 검수기준", "가능 / 보류", "", "미비 기간만큼 조정")),
        ] },
      ],
    },
    {
      file: "20_검수실행_기록표.xlsx",
      sheets: [
        { name: "검수 실행", rows: acceptanceRunRows(input) },
        { name: "반려 재검수", rows: [
          header("반려 ID", "관련 테스트 ID", "반려 사유", "첨부 자료", "수급자 확인", "재전달일", "재검수 결과"),
          row("REJECT-001", "", "", "", "", "", "합격 / 반려 / 보류"),
        ] },
      ],
    },
    {
      file: "21_계약서_리스크_검토표.xlsx",
      sheets: [
        { name: "리스크 검토", rows: riskReviewRows(input) },
        { name: "전문가 검토 회수", rows: expertReviewRows() },
        { name: "누락 조항", rows: [
          header("조항/항목", "현재 상태", "위험도", "보완 문구 방향", "처리 상태"),
          row("착수자료 확정", "확인 필요", "중", "기능별 자료 확정 전 착수 보류", "미처리 / 처리 / 제외"),
          row("검수 실행 기록", "확인 필요", "중", "테스트 수행 결과와 증거 링크 기록", "미처리 / 처리 / 제외"),
          row("계약 범위 밖 요청", "확인 필요", "상", "변경요청서 승인 후 착수", "미처리 / 처리 / 제외"),
        ] },
      ],
    },
  ];

  if (optional.designUx) {
    workbooks.push({
      file: "16_선택별첨_디자인_UX_수정범위.xlsx",
      sheets: [
        { name: "사례별 분류표", rows: [header("요청", "분류", "처리", "입력해야 할 기준"), ...designUxRevisionCases] },
      ],
    });
  }

  if (optional.revisionCounting) {
    workbooks.push({
      file: "17_선택별첨_수정횟수_산정표.xlsx",
      sheets: [
        { name: "산정표", rows: [
          header("상황", "산정", "메모"),
          row("수정 1회", input.revisions?.unit, "계약상 수정 회차 기준"),
          ...revisionCountingRows,
        ] },
      ],
    });
  }

  return workbooks.sort((a, b) => a.file.localeCompare(b.file, "ko"));
}
