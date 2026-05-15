import { h, table } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  return {
    file: "02_RFP_과업내용서.hwp",
    title: `${ctx.projectName} RFP 및 과업내용서`,
    blocks: [
      h("사업 개요"),
      table(["항목", "내용"], [
        ["프로젝트명", ctx.projectName],
        ["발주자", ctx.buyer],
        ["수급자", ctx.supplier],
        ["계약 유형", input.project?.type],
        ["목적", input.project?.summary],
        ["제외 범위", (input.exclusions || []).join("\n")],
      ]),
      h("요구사항 목록"),
      table(["ID", "분류", "명칭", "설명", "검수 기준", "상태"], ctx.requirementRows()),
      h("견적 row 기반 작업 범위"),
      table(["견적 ID", "항목", "연결 요구사항", "전제조건", "완수 조건", "테스트 조건", "부수 항목"], ctx.estimateScopeRows()),
      h("착수 자료"),
      table(["자료", "상태"], Object.entries(input.startMaterials || {})),
    ],
  };
}
