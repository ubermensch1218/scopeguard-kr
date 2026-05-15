import { h, p, table } from "../helpers.mjs";

function optionalAppendixBlocks(ctx) {
  const rows = [
    ctx.optionalAppendices.designUx
      ? ["디자인/UX 수정 범위", "16_선택별첨_디자인_UX_수정범위.hwp"]
      : null,
    ctx.optionalAppendices.revisionCounting
      ? ["수정횟수 산정 로직", "17_선택별첨_수정횟수_산정표.hwp"]
      : null,
  ].filter(Boolean);
  if (!rows.length) return [];
  return [
    h("제11조 선택 별첨"),
    p("양 당사자가 아래 별첨을 본 계약에 포함하기로 선택한 경우에만 해당 별첨의 기준을 적용한다. 선택하지 않은 별첨은 본 계약에 자동 포함되지 않는다."),
    table(["선택 별첨", "파일"], rows),
  ];
}

export function build(ctx) {
  const { input } = ctx;
  return {
    file: "03_SW_개발용역계약서_초안.hwp",
    title: `${ctx.projectName} SW 개발용역계약서 초안`,
    blocks: [
      p("본 문서는 입력값을 기반으로 작성된 계약서 초안입니다. 외주개발에서 반복되는 분쟁을 줄이기 위한 운영 기준을 계약 조항과 부속서류에 반영합니다. 실제 체결 전 전문가 검토가 필요합니다.", "Quote"),
      h("제1조 목적"),
      p("발주자는 수급자에게 본 계약에서 정한 소프트웨어 개발용역을 의뢰하고, 수급자는 확정된 과업 범위, 검수 기준, 수정 및 변경요청 절차에 따라 산출물을 제공한다."),
      h("제2조 계약 기본 정보"),
      table(["항목", "내용"], [
        ["프로젝트명", ctx.projectName],
        ["발주자", ctx.buyer],
        ["수급자", ctx.supplier],
        ["계약금액", input.payment?.total],
        ["견적 기준", input.estimate?.pricingBasis],
        ["착수일", input.schedule?.startDate],
        ["납품일", input.schedule?.deliveryDate],
      ]),
      h("제3조 개발 착수 조건"),
      p("수급자는 PRD, 기능정의서, 화면설계서, 사용자 흐름, 콘텐츠·문구, 데이터/API 정보 및 검수 기준이 확정된 기능에 한하여 개발 착수 의무를 부담한다."),
      table(["착수 자료", "상태"], Object.entries(input.startMaterials || {})),
      h("제4조 과업 범위와 제외 범위"),
      p("수급자의 과업 범위는 본 계약서, RFP/과업내용서, 검수기준표 및 견적산정표의 각 row에 명시된 항목으로 한정한다. 세부 작업은 각 견적 row의 부수 항목으로 정한다."),
      table(["구분", "내용"], [
        ["포함 범위", (input.scopeIncluded || []).join("\n")],
        ["제외 범위", (input.exclusions || []).join("\n")],
      ]),
      table(["견적 ID", "항목", "연결 요구사항", "전제조건", "완수 조건", "테스트 조건", "부수 항목"], ctx.estimateScopeRows()),
      h("제5조 검수"),
      p(`발주자는 산출물 제출일로부터 ${input.acceptance?.days || "정해진 기간"} 이내에 기능별 검수 기준과 견적 row의 테스트 조건에 따라 합격 또는 반려 여부를 서면으로 통지한다.`),
      p("반려 시 발주자는 요구사항 ID, 재현 절차, 기대 결과, 실제 결과, 첨부 자료를 포함한 구체적 반려 사유를 제출한다. 기한 내 구체적 반려 사유가 없으면 해당 산출물은 승인된 것으로 본다."),
      h("제6조 하자와 무상수정"),
      table(["항목", "내용"], [
        ["하자 정의", input.defects?.definition],
        ["하자 대응 개시", input.defects?.responseStart],
        ["무상수정", input.revisions?.included],
        ["수정 1회 기준", input.revisions?.unit],
        ["경미한 수정", input.revisions?.minorScope],
        ["하자보수 차감 여부", "하자 보완은 무상수정 횟수에 산입하지 않음"],
      ]),
      h("제7조 변경요청"),
      table(["항목", "내용"], [
        ["변경요청 대상", (input.changeRequests?.targets || []).join("\n")],
        ["착수 조건", input.changeRequests?.startCondition],
        ["최소 과금 단위", input.changeRequests?.minimumBillingUnit],
        ["일정 영향", input.changeRequests?.scheduleImpact],
      ]),
      p("변경요청 비용은 견적 산정표의 변경요청 단가 또는 별도 합의한 견적 row를 기준으로 산정한다."),
      h("제8조 회의 및 커뮤니케이션"),
      table(["항목", "내용"], [
        ["온라인 회의", input.meetings?.onlineCadence],
        ["대면회의", input.meetings?.onsiteIncluded],
        ["추가 대면회의", input.meetings?.extraOnsiteBilling],
        ["회의록 승인", input.meetings?.minutesApproval],
        ["구두요청 효력", input.meetings?.verbalRequestEffect],
      ]),
      h("제9조 권리 귀속 및 인도"),
      p("프로젝트 전용 산출물, 수급자 사전보유자산, 오픈소스·외부 라이브러리는 별도 목록으로 분리한다."),
      h("제10조 분쟁 축소 절차"),
      p("분쟁 발생 시 양 당사자는 계약서, RFP/과업내용서, 검수기준표, 수정요청서, 변경요청서, 회의록, 납품확인서, 하자신고서 순으로 사실관계를 확인하고, 소송 전 조정·합의·추가 검수·변경요청 정산을 우선 협의한다."),
      ...optionalAppendixBlocks(ctx),
      h("서명"),
      table(["구분", "성명/회사명", "서명"], [
        ["발주자", ctx.buyer, ""],
        ["수급자", ctx.supplier, ""],
      ]),
    ],
  };
}
