import { table } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  return {
    file: "11_권리귀속_소스코드_인도목록.hwp",
    title: `${ctx.projectName} 권리귀속 및 소스코드 인도목록`,
    blocks: [
      table(["항목", "내용"], [
        ["프로젝트 전용 산출물", (input.rights?.projectAssets || []).join("\n")],
        ["수급자 사전보유자산", (input.rights?.preExistingAssets || []).join("\n")],
        ["오픈소스/외부 라이브러리", (input.rights?.thirdPartyAssets || []).join("\n")],
        ["소스코드 인도", input.deliverables?.sourceCode],
      ]),
    ],
  };
}
