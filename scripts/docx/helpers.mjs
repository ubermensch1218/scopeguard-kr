export const references = [
  ["소프트웨어사업 계약 및 관리감독에 관한 지침", "RFP 요구사항 분류와 과업 변경 절차를 설계할 때 참고", "https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000223356"],
  ["소프트웨어 진흥법", "SW 계약에서 과업 범위와 계약 내용을 명확히 해야 하는 취지를 확인할 때 참고", "https://www.law.go.kr/법령/소프트웨어진흥법"],
  ["한국공정거래조정원 분쟁조정 사례", "시스템 소프트웨어 개발 및 공급업자의 거래상 지위 남용 관련 분쟁 유형 참고", "https://fairnet.kofair.or.kr/web/user/exam/case/402/162/exam402List.do"],
  ["공정위 결정 18877", "조달청 등 발주 소프트웨어 테스팅 시스템 구매 입찰 관련 결정", "https://www.law.go.kr/DRF/lawService.do?target=ftc&ID=18877&type=HTML"],
  ["공정위 결정 15923", "부산 북구청 등 4개 지자체 온나라시스템 구축 입찰 관련 결정", "https://www.law.go.kr/DRF/lawService.do?target=ftc&ID=15923&type=HTML"],
  ["공정위 결정 15561", "11개 시·도 교육청 교육기관용 소프트웨어 라이선스 구매 입찰 관련 결정", "https://www.law.go.kr/DRF/lawService.do?target=ftc&ID=15561&type=HTML"],
  ["공정위 결정 1923", "한국수력원자력 UAE 원전 운영관리시스템 소프트웨어 구매 입찰 관련 결정", "https://www.law.go.kr/DRF/lawService.do?target=ftc&ID=1923&type=HTML"],
  ["대법원 공개문서 2021다236111", "프로그램 권리 귀속과 사전보유자산 분리 필요성을 확인할 때 참고", "https://www.law.go.kr/DRF/lawService.do?target=prec&ID=226981&type=HTML"],
  ["대법원 공개문서 2021두48359", "SW 위탁개발의 성격, 수행 주체, 비용 성격을 구분할 때 참고", "https://www.law.go.kr/DRF/lawService.do?target=prec&ID=599749&type=HTML"],
];

export const designUxRevisionCases = [
  ["더 예쁘게, 더 고급스럽게", "분류 불가", "정량 기준 또는 레퍼런스가 없으면 검수 반려 사유가 아님", "기준 이미지, 컴포넌트, 화면설계 기준을 먼저 확정"],
  ["라운딩 8px을 12px로 변경", "경미한 수정", "동일 통합 수정요청서에 포함된 경우 해당 회차 안에서 처리", "전체 디자인 방향 변경이면 변경요청"],
  ["A안으로 승인한 화면을 B안으로 변경", "변경요청", "승인사항 번복으로 보며 비용·일정 재산정", "기존 row의 전제조건 또는 완수 조건 변경"],
  ["버튼명, 안내 문구, 오탈자 수정", "경미한 수정", "발주자가 최종 문안을 서면 제공하면 해당 회차 안에서 처리", "전문 문구의 정확성은 발주자 확인 필요"],
  ["사용자 흐름을 3단계에서 1단계로 변경", "변경요청", "화면 구조와 정보구조 변경을 수반", "새 완수 조건과 테스트 조건 필요"],
  ["화면설계서에 있는 상태가 구현되지 않음", "하자", "계약 범위와 검수 기준에 있는 항목이면 수정횟수 미차감", "재현 절차와 기대 결과 제출"],
];

export const revisionCountingRows = [
  ["통합 수정요청 1세트", "1회", "산출물 제출 후 정해진 기간 안에 서면으로 묶어 제출한 요청 묶음"],
  ["동일 기간 내 복수 항목", "1회", "문구, 이미지, 색상, 간격 등 여러 항목이 있어도 같은 요청서면 1회"],
  ["분할 제출", "별도 1회", "같은 산출물에 대한 의견을 나누어 추가 제출하면 새 회차"],
  ["반영 후 방향 변경", "별도 1회 또는 변경요청", "A로 고친 뒤 B로 바꾸는 요청은 기존 미반영이 아님"],
  ["수급자 미반영 재작업", "미차감", "승인된 수정요청을 수급자가 반영하지 못한 경우"],
  ["재현 가능한 하자", "미차감", "계약 범위 기능 불능 또는 검수 기준 미달"],
  ["신규 기능/화면/데이터 구조 변경", "변경요청", "수정횟수 차감이 아니라 별도 비용·일정 합의"],
];

export const v = (value, fallback = "확인 필요") => {
  if (value === 0) return "0";
  if (value === false) return "아니오";
  if (value === true) return "예";
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  return value === undefined || value === null || value === "" ? fallback : String(value);
};

export function p(text, style = "Normal") {
  return { type: "p", text, style };
}

export function h(text) {
  return { type: "p", text, style: "Heading1" };
}

export function table(headers, rows) {
  return { type: "table", headers, rows: rows.length ? rows : [headers.map(() => "")] };
}

export function formDoc(file, title, rows) {
  return { file, title, blocks: [table(["항목", "내용"], rows)] };
}

export function createDocxContext(input) {
  const projectName = v(input.project?.name, "SW 외주개발 프로젝트");
  const buyer = v(input.parties?.buyer?.name, "발주자");
  const supplier = v(input.parties?.supplier?.name, "수급자");

  const byPath = (obj, keyPath) => keyPath.split(".").reduce((acc, part) => acc?.[part], obj);

  return {
    input,
    optionalAppendices: input.optionalAppendices || {},
    references,
    projectName,
    buyer,
    supplier,
    rowsFromObject: (obj, labels) => labels.map(([label, key]) => [label, v(byPath(obj, key))]),
    requirementRows: () => (input.requirements || []).map((req) => [
      v(req.id),
      v(req.category),
      v(req.name),
      v(req.description),
      v(req.acceptance),
      v(req.status),
    ]),
    milestoneRows: () => (input.milestones || []).map((milestone) => [
      v(milestone.name),
      v(milestone.due),
      v(milestone.deliverable),
      v(milestone.payment),
      v(milestone.acceptance),
    ]),
    estimateRows: () => (input.estimate?.rows || []).map((row) => [
      v(row.id),
      v(row.category),
      v(row.item),
      v(row.linkedRequirementIds),
      v(row.unit),
      v(row.quantity),
      v(row.unitPrice),
      v(row.amount),
      v(row.preconditions || row.assumption),
      v(row.completionCondition),
      v(row.testCondition),
      v(row.subItems),
      v(row.disputeReduced),
    ]),
    estimateScopeRows: () => (input.estimate?.rows || []).map((row) => [
      v(row.id),
      v(row.item),
      v(row.linkedRequirementIds),
      v(row.preconditions || row.assumption),
      v(row.completionCondition),
      v(row.testCondition),
      v(row.subItems),
    ]),
    estimatePaymentRows: () => (input.estimate?.rows || []).map((row) => [
      v(row.id),
      v(row.category),
      v(row.item),
      v(row.quantity),
      v(row.unit),
      v(row.unitPrice),
      v(row.amount),
    ]),
    changeRequestRateRows: () => (input.estimate?.changeRequestRates || []).map((row) => [
      v(row.item),
      v(row.minimumUnit),
      v(row.rate),
      v(row.basis),
    ]),
    costRows: () => Object.entries(input.operationCosts || {}).map(([key, value]) => [key, v(value)]),
  };
}
