import { designUxRevisionCases, h, p, table } from "../helpers.mjs";

export function build(ctx) {
  if (!ctx.optionalAppendices.designUx) return [];
  return {
    file: "16_선택별첨_디자인_UX_수정범위.docx",
    title: `${ctx.projectName} 선택별첨 - 디자인/UX 수정 범위`,
    blocks: [
      p("이 별첨은 입력값에서 선택한 경우에만 계약문서 세트에 포함됩니다.", "Quote"),
      h("목적"),
      p("디자인 또는 UX에 관한 요청이 하자인지, 무상수정인지, 변경요청인지 분류하기 위한 기준입니다. 추상적 선호 표현만으로는 검수 반려 또는 하자 신고 사유가 되지 않으며, 확정된 화면설계서, Figma, 컴포넌트 기준, 레퍼런스 또는 견적 row의 완수 조건을 기준으로 판단합니다."),
      h("사례별 분류표"),
      table(["요청 예시", "분류", "처리 기준", "필요 조치"], designUxRevisionCases),
      h("입력해야 할 기준"),
      table(["항목", "값"], [
        ["화면 목록", ""],
        ["기준 디자인 파일 또는 링크", ""],
        ["컴포넌트 기준", ""],
        ["색상/폰트/간격/라운딩 기준", ""],
        ["반응형 기준", ""],
        ["디자인 검수 담당자", ""],
        ["승인 후 변경 시 처리 방식", "수정요청 / 변경요청 / 별도 합의"],
      ]),
    ],
  };
}
