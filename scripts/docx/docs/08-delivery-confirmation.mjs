import { formDoc } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  return formDoc("08_납품확인서.docx", `${ctx.projectName} 납품확인서`, [
    ["납품일", ""],
    ["납품 버전", ""],
    ["배포 URL 또는 저장소", ""],
    ["테스트 계정", ""],
    ["소스코드", input.deliverables?.sourceCode],
    ["DB 스키마", input.deliverables?.dbSchema],
    ["관리자 계정", input.deliverables?.adminAccount],
    ["운영 가이드", input.deliverables?.operationGuide],
  ]);
}
