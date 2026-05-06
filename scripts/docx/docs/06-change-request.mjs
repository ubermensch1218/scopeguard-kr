import { formDoc } from "../helpers.mjs";

export function build(ctx) {
  return formDoc("06_변경요청서.docx", `${ctx.projectName} 변경요청서`, [
    ["요청자", ""],
    ["요청일", ""],
    ["기준 견적 row", ""],
    ["변경 대상 요구사항 ID", ""],
    ["기존 합의 내용", ""],
    ["변경 요청 내용", ""],
    ["추가/변경 부수 항목", ""],
    ["비용 영향", ""],
    ["일정 영향", ""],
    ["검수 기준", ""],
    ["착수 조건", ctx.input.changeRequests?.startCondition],
  ]);
}
