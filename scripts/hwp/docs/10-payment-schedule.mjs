import { h, table } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  return {
    file: "10_대금_마일스톤_지급표.hwp",
    title: `${ctx.projectName} 대금 및 마일스톤 지급표`,
    blocks: [
      table(["항목", "내용"], [
        ["계약금액", input.payment?.total],
        ["견적 기준", input.estimate?.pricingBasis],
        ["부가세", input.estimate?.vat],
        ["선금", input.payment?.deposit],
        ["중도금", input.payment?.interim],
        ["잔금", input.payment?.balance],
        ["지급 기한", input.payment?.paymentDue],
      ]),
      h("마일스톤"),
      table(["마일스톤", "기한", "산출물", "지급", "검수 기준"], ctx.milestoneRows()),
      h("견적 row 금액"),
      table(["ID", "분류", "항목", "수량", "단위", "단가", "금액"], ctx.estimatePaymentRows()),
    ],
  };
}
