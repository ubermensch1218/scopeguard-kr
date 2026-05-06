import { p, table } from "../helpers.mjs";

export function build(ctx) {
  return {
    file: "00_참고문헌.docx",
    title: "참고문헌",
    blocks: [
      p("이 문서는 계약서 자동작성기가 참고할 수 있는 공개 문서 목록입니다. 계약 조항의 판단이나 법률 의견이 아닙니다."),
      table(["문서", "활용 위치", "링크"], ctx.references),
    ],
  };
}
