import { table, v } from "../helpers.mjs";

export function build(ctx) {
  return {
    file: "14_공급자_수요자_합의표.hwp",
    title: "공급자/수요자 합의표",
    blocks: [
      table(["항목", "수요자 이점", "공급자 이점", "균형안"], [
        ["착수자료", "원하는 기능 누락 방지", "불명확한 요구 착수 방지", "확정된 기능부터 착수"],
        ["무상수정", "납품 후 피드백 반영권 확보", "무한 수정 방지", v(ctx.input.revisions?.included)],
        ["하자", "계약 기능의 정상 동작 보장", "하자와 기획 변경 분리", "하자는 무상수정 횟수 미차감"],
        ["변경요청", "필요 변경 가능", "범위 변경의 비용·일정 보전", "서면 승인 후 착수"],
        ["회의", "중요 의사결정 기록", "구두요청 분쟁 방지", v(ctx.input.meetings?.minutesApproval)],
      ]),
    ],
  };
}
