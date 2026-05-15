import { h, table } from "../helpers.mjs";

export function build(ctx) {
  return {
    file: "12_운영비_API_계정_인수인계서.hwp",
    title: `${ctx.projectName} 운영비/API/계정 인수인계서`,
    blocks: [
      h("운영 비용"),
      table(["항목", "부담 주체"], ctx.costRows()),
      h("계정 인수인계"),
      table(["항목", "내용"], [
        ["관리자 계정", ctx.input.deliverables?.adminAccount],
        ["배포 계정", ""],
        ["DB 계정", ""],
        ["외부 API 키", ""],
        ["권한 회수 및 폐기 일자", ""],
      ]),
    ],
  };
}
