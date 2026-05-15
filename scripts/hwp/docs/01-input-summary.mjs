import { h, table } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  return {
    file: "01_입력값_요약표.hwp",
    title: `${ctx.projectName} 입력값 요약표`,
    blocks: [
      h("프로젝트"),
      table(["항목", "값"], ctx.rowsFromObject(input, [
        ["프로젝트명", "project.name"],
        ["계약 유형", "project.type"],
        ["작성 관점", "project.viewpoint"],
        ["프로젝트 설명", "project.summary"],
      ])),
      h("당사자"),
      table(["항목", "값"], [
        ["발주자", ctx.buyer],
        ["수급자", ctx.supplier],
        ["발주자 담당자", input.parties?.buyer?.manager],
        ["수급자 담당자", input.parties?.supplier?.manager],
      ]),
      h("핵심 운영 조건"),
      table(["항목", "값"], [
        ["검수 기간", input.acceptance?.days],
        ["무상수정 방식", input.revisions?.included],
        ["수정 1회 기준", input.revisions?.unit],
        ["대면회의", input.meetings?.onsiteIncluded],
        ["하자 대응 개시", input.defects?.responseStart],
        ["변경요청 착수 조건", input.changeRequests?.startCondition],
        ["견적 기준", input.estimate?.pricingBasis],
        ["견적 row 수", (input.estimate?.rows || []).length],
        ["디자인/UX 별첨", ctx.optionalAppendices.designUx],
        ["수정횟수 산정 별첨", ctx.optionalAppendices.revisionCounting],
      ]),
    ],
  };
}
