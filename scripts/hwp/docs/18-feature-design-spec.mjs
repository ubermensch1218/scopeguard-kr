import { h, p, table, v } from "../helpers.mjs";

function linkedEstimateIds(input, requirementId) {
  return (input.estimate?.rows || [])
    .filter((row) => (row.linkedRequirementIds || []).includes(requirementId))
    .map((row) => row.id)
    .join(", ");
}

function featureSpecs(input) {
  const explicitSpecs = input.featureSpecs || [];
  if (explicitSpecs.length) return explicitSpecs;

  return (input.requirements || []).map((req) => ({
    id: req.id,
    name: req.name || req.title,
    status: req.status,
    linkedRequirementIds: [req.id],
    entryPoints: [],
    actors: [],
    designRequirements: [],
    flow: "",
    finalScreens: [],
    finalResults: [req.acceptance],
    acceptance: req.acceptance,
    disputeReduced: "",
  }));
}

function designRequirementText(requirements) {
  if (!requirements?.length) return "확인 필요";
  return requirements
    .map((item) => {
      if (typeof item === "string") return item;
      return `${v(item.name)}: ${v(item.status)} / 기준: ${v(item.criteria)}`;
    })
    .join("\n");
}

export function build(ctx) {
  const { input } = ctx;
  const specs = featureSpecs(input);
  const rows = specs.map((spec) => {
    const requirementIds = spec.linkedRequirementIds || [spec.id];
    const estimateIds = spec.linkedEstimateIds || requirementIds.map((id) => linkedEstimateIds(input, id)).filter(Boolean);
    return [
      v(spec.id),
      v(spec.name),
      v(requirementIds),
      v(estimateIds),
      v(spec.entryPoints),
      v(spec.actors),
      designRequirementText(spec.designRequirements),
      v(spec.finalScreens),
      v(spec.finalResults || spec.acceptance),
    ];
  });

  return {
    file: "18_기능별_구현_디자인_명세서.hwp",
    title: `${ctx.projectName} 기능별 구현·디자인 명세서`,
    blocks: [
      p("본 문서는 기능별 진입점, 디자인 요건 충족 여부, 디자인 플로우, 최종 화면/결과를 RFP·견적 row·검수기준과 연결하기 위한 양식입니다. 기능별 기준이 비어 있으면 해당 기능은 개발 착수 전 확인 필요 항목으로 남깁니다.", "Quote"),
      h("작성 원칙"),
      table(["항목", "원칙"], [
        ["기능 단위", "요구사항 ID 또는 견적 row와 1:1 또는 N:1로 연결"],
        ["진입점", "사용자가 어디에서 해당 기능을 시작하는지 화면, 버튼, URL, 메뉴, 알림 등으로 표시"],
        ["디자인 요건 충족 여부", "화면설계, 디자인 기준, 상태값, 반응형, 빈 상태, 오류 상태를 충족/미충족/해당 없음으로 표시"],
        ["디자인 플로우", "Mermaid 원문을 기준으로 관리하고, SVG는 필요할 때 렌더링 산출물로 첨부"],
        ["최종 결과", "완료 화면, 저장 결과, 알림, 데이터 변경, 관리자 반영 결과를 함께 기재"],
      ]),
      h("기능별 요약"),
      table(["기능 ID", "기능명", "연결 요구사항", "연결 견적 row", "진입점", "사용자/권한", "디자인 요건 충족 여부", "최종 화면", "최종 결과"], rows),
      h("디자인 플로우"),
      table(["기능 ID", "Mermaid 원문", "SVG 첨부", "검토 메모"], specs.map((spec) => [
        v(spec.id),
        v(spec.flow || "flowchart TD\n  A[진입점] --> B[사용자 입력]\n  B --> C{검증}\n  C -->|성공| D[최종 결과]\n  C -->|실패| E[오류/빈 상태]"),
        v(spec.flowSvg || "필요 시 첨부"),
        v(spec.flowMemo),
      ])),
      h("화면/결과 검수 연결"),
      table(["기능 ID", "화면/상태", "완료 기준", "테스트 조건", "분쟁 예방 메모"], specs.map((spec) => [
        v(spec.id),
        v(spec.finalScreens),
        v(spec.completionCondition || spec.acceptance),
        v(spec.testCondition),
        v(spec.disputeReduced || "진입점, 화면 상태, 완료 결과 불일치 분쟁 축소"),
      ])),
      h("누락 점검"),
      table(["점검 항목", "상태"], [
        ["기능별 진입점이 지정되었는가", "충족 / 미충족 / 해당 없음"],
        ["디자인 기준과 화면설계가 연결되었는가", "충족 / 미충족 / 해당 없음"],
        ["빈 상태, 오류 상태, 로딩 상태가 정의되었는가", "충족 / 미충족 / 해당 없음"],
        ["최종 화면과 데이터 결과가 구분되었는가", "충족 / 미충족 / 해당 없음"],
        ["검수기준표와 테스트 조건으로 연결되었는가", "충족 / 미충족 / 해당 없음"],
      ]),
    ],
  };
}
