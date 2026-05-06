import { formDoc, h, table, revisionCountingRows } from "../helpers.mjs";

export function build(ctx) {
  const doc = formDoc("05_수정요청서.docx", `${ctx.projectName} 수정요청서`, [
    ["제출일", ""],
    ["요청자", ""],
    ["대상 화면/기능", ""],
    ["현재 상태", ""],
    ["요청 내용", ""],
    ["첨부 자료", ""],
    ["분류", "문구 / 이미지 / 색상 / 라운딩 / 간격 / 배치 / 표시 오류 / 기타"],
    ["수정 회차", ctx.input.revisions?.unit],
  ]);
  if (ctx.optionalAppendices.revisionCounting) {
    doc.blocks.push(h("수정횟수 산정 기준"));
    doc.blocks.push(table(["상황", "산정", "메모"], revisionCountingRows));
  }
  return doc;
}
