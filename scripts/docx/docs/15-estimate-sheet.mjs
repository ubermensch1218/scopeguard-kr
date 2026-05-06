import { h, p, table } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  return {
    file: "15_견적산정표.docx",
    title: `${ctx.projectName} 견적 산정표`,
    blocks: [
      p("견적 row는 계약금액, 마일스톤 지급표, 변경요청 단가와 계약서 표를 자동 생성하기 위한 기준입니다. 각 row에는 전제조건, 완수 조건, 테스트 조건, 부수 항목과 줄이는 분쟁을 함께 적습니다.", "Quote"),
      h("견적 기본값"),
      table(["항목", "내용"], [
        ["통화", input.estimate?.currency],
        ["부가세", input.estimate?.vat],
        ["산정 방식", input.estimate?.pricingBasis],
        ["메모", input.estimate?.memo],
      ]),
      h("견적 row"),
      table(["ID", "분류", "항목", "연결 요구사항", "단위", "수량", "단가", "금액", "전제조건", "완수 조건", "테스트 조건", "부수 항목", "줄이는 분쟁"], ctx.estimateRows()),
      h("변경요청 단가"),
      table(["항목", "최소 단위", "단가", "기준"], ctx.changeRequestRateRows()),
    ],
  };
}
