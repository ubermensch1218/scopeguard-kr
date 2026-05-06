import { formDoc } from "../helpers.mjs";

export function build(ctx) {
  return formDoc("07_회의록_승인서.docx", `${ctx.projectName} 회의록 및 승인서`, [
    ["일시", ""],
    ["방식", "온라인 / 대면"],
    ["참석자", ""],
    ["안건", ""],
    ["결정 사항", ""],
    ["보류 사항", ""],
    ["담당자", ""],
    ["승인 기준", ctx.input.meetings?.minutesApproval],
  ]);
}
