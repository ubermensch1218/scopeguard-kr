import { formDoc } from "../helpers.mjs";

export function build(ctx) {
  return formDoc("09_하자신고서.docx", `${ctx.projectName} 하자신고서`, [
    ["신고일", ""],
    ["신고자", ""],
    ["대상 기능/요구사항 ID", ""],
    ["발생 환경", ""],
    ["심각도", "차단 / 높음 / 보통 / 낮음"],
    ["재현 절차", ""],
    ["기대 결과", ""],
    ["실제 결과", ""],
    ["첨부 자료", ""],
  ]);
}
