import { h, p, revisionCountingRows, table } from "../helpers.mjs";

export function build(ctx) {
  if (!ctx.optionalAppendices.revisionCounting) return [];
  return {
    file: "17_선택별첨_수정횟수_산정표.docx",
    title: `${ctx.projectName} 선택별첨 - 수정횟수 산정표`,
    blocks: [
      p("이 별첨은 입력값에서 선택한 경우에만 계약문서 세트에 포함됩니다.", "Quote"),
      h("기본 원칙"),
      table(["항목", "내용"], [
        ["수정 1회", "산출물 제출 후 정해진 기간 안에 서면으로 제출된 통합 수정요청 1세트"],
        ["하자 보완", "무상수정 횟수에서 차감하지 않음"],
        ["변경요청", "승인된 기획, 화면, 디자인 방향, 데이터 구조, 운영 정책을 바꾸는 요청"],
      ]),
      h("산정표"),
      table(["상황", "산정", "메모"], revisionCountingRows),
      h("요청서 작성 단위"),
      table(["항목", "값"], [
        ["대상 산출물", ""],
        ["제출 기한", ""],
        ["이번 요청 회차", ""],
        ["포함 요청 수", ""],
        ["하자 제외 항목", ""],
        ["변경요청 전환 항목", ""],
        ["양측 확인", ""],
      ]),
    ],
  };
}
