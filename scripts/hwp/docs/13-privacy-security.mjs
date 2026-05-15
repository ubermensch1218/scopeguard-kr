import { table } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  return {
    file: "13_개인정보_보안_요구사항.hwp",
    title: `${ctx.projectName} 개인정보 및 보안 요구사항`,
    blocks: [
      table(["항목", "내용"], [
        ["개인정보 처리 여부", input.privacy?.usesPersonalData],
        ["민감정보 처리 여부", input.privacy?.usesSensitiveData],
        ["처리 목적", input.privacy?.purpose],
        ["처리 항목", input.privacy?.items],
        ["보존 기간", input.privacy?.retention],
        ["파기 기준", input.privacy?.deletion],
        ["접근통제", input.security?.accessControl],
        ["로그", input.security?.logging],
      ]),
    ],
  };
}
