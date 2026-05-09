import { h, p, table, revisionCountingRows } from "../helpers.mjs";

export function build(ctx) {
  const { input } = ctx;
  const doc = {
    file: "05_수정요청서.docx",
    title: `${ctx.projectName} 수정요청서`,
    blocks: [
      p("본 문서는 산출물 제출 후 발주자가 계약상 제출기한 안에 일괄 제출하는 통합 수정요청서입니다. 하자, 신규 기능, 승인사항 번복, 구조 변경은 본 양식에서 별도 분류하여 처리합니다.", "Quote"),
      h("기본 정보"),
      table(["항목", "내용"], [
        ["프로젝트명", ctx.projectName],
        ["발주자", ctx.buyer],
        ["수급자", ctx.supplier],
        ["산출물명/버전", ""],
        ["산출물 제출일", ""],
        ["수정요청 제출일", ""],
        ["제출 채널", "이메일 / 프로젝트 보드 / 계약관리 도구 / 기타"],
        ["수정 회차", input.revisions?.unit],
        ["제출 기한", input.acceptance?.days],
      ]),
      h("수정 요청 항목"),
      table(["번호", "대상 화면/기능", "관련 요구사항/견적 ID", "현재 상태", "요청 내용", "분류", "기대 반영 결과", "첨부 자료"], [
        ["1", "", "", "", "", "문구 / 이미지 / 색상 / 라운딩 / 간격 / 배치 / 표시 오류 / 검수미달 / 기타", "", ""],
      ]),
      h("분류 기준"),
      table(["분류", "판단 기준", "처리 방식"], [
        ["하자", "계약 범위 기능 불능, 재현 가능한 오류, 검수 기준 미달", "무상수정 회차 미차감"],
        ["무상수정", input.revisions?.minorScope, input.revisions?.included],
        ["변경요청", (input.changeRequests?.targets || []).join(", "), input.changeRequests?.startCondition],
        ["제외/보류", "자료 미제공, 기준 문서 부재, 검수와 무관한 선호 변경", "자료 확정 또는 변경요청서 작성 후 처리"],
      ]),
      h("처리 결과"),
      table(["항목", "내용"], [
        ["접수 여부", "접수 / 반려 / 변경요청 전환 / 보류"],
        ["반영 대상 항목", ""],
        ["반려 또는 보류 사유", ""],
        ["변경요청 전환 항목", ""],
        ["수급자 반영 예정일", ""],
        ["재전달 예정 산출물", ""],
      ]),
      h("승인"),
      table(["구분", "성명/회사명", "확인일", "서명"], [
        ["발주자", ctx.buyer, "", ""],
        ["수급자", ctx.supplier, "", ""],
      ]),
    ],
  };
  if (ctx.optionalAppendices.revisionCounting) {
    doc.blocks.push(h("수정횟수 산정 기준"));
    doc.blocks.push(table(["상황", "산정", "메모"], revisionCountingRows));
  }
  return doc;
}
