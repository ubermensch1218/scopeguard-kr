import { h, table } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  const screenRows = ctx.optionalAppendices.designUx
    ? [
        ["화면/UX 변경 분류", "선택 별첨의 디자인/UX 수정 범위 기준 적용"],
        ["선호 변경", "정량 기준 또는 승인 자료가 없으면 검수 반려 사유로 보지 않음"],
      ]
    : [
        ["화면 확인", "화면설계서 또는 Figma가 제공된 경우 해당 화면 목록, 레이아웃, 필수 상태 기준"],
        ["디자인/UX 변경 분류", "선택 별첨을 포함한 경우에만 계약 기준으로 적용"],
      ];
  return {
    file: "04_검수기준표.docx",
    title: `${ctx.projectName} 검수기준표`,
    blocks: [
      table(["ID", "분류", "기능", "검수 기준", "상태", "판정"], (input.requirements || []).map((req) => [
        req.id,
        req.category,
        req.name,
        req.acceptance,
        req.status,
        "",
      ])),
      h("견적 row 테스트 조건"),
      table(["견적 ID", "항목", "연결 요구사항", "완수 조건", "테스트 조건", "부수 항목"], ctx.estimateScopeRows().map((row) => [row[0], row[1], row[2], row[4], row[5], row[6]])),
      h("화면 기준"),
      table(["항목", "내용"], screenRows),
      h("검수 절차"),
      table(["항목", "내용"], [
        ["검수 기한", input.acceptance?.days],
        ["반려 방식", input.acceptance?.rejectionFormat],
        ["승인 처리", input.acceptance?.deemedApproval],
      ]),
    ],
  };
}
