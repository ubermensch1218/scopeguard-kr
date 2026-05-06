import fs from "node:fs";

const required = [
  "index.html",
  ".github/CODEOWNERS",
  ".github/pull_request_template.md",
  ".github/workflows/audit.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/clause_review.yml",
  ".claude/skills/sw-contract-scopeguard/SKILL.md",
  ".codex/skills/sw-contract-scopeguard/SKILL.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "README.md",
  "assets/app.js",
  "assets/styles.css",
  "scripts/build-docx-package.mjs",
  "scripts/audit-publish.mjs",
  "scripts/docx/helpers.mjs",
  "scripts/docx/docs/index.mjs",
  "scripts/docx/docs/00-reference.mjs",
  "scripts/docx/docs/01-input-summary.mjs",
  "scripts/docx/docs/02-rfp-spec.mjs",
  "scripts/docx/docs/03-contract-draft.mjs",
  "scripts/docx/docs/04-acceptance-criteria.mjs",
  "scripts/docx/docs/05-revision-request.mjs",
  "scripts/docx/docs/06-change-request.mjs",
  "scripts/docx/docs/07-meeting-minutes.mjs",
  "scripts/docx/docs/08-delivery-confirmation.mjs",
  "scripts/docx/docs/09-defect-report.mjs",
  "scripts/docx/docs/10-payment-schedule.mjs",
  "scripts/docx/docs/11-rights-handover.mjs",
  "scripts/docx/docs/12-ops-handover.mjs",
  "scripts/docx/docs/13-privacy-security.mjs",
  "scripts/docx/docs/14-agreement-options.mjs",
  "scripts/docx/docs/15-estimate-sheet.mjs",
  "scripts/docx/docs/16-design-ux-appendix.mjs",
  "scripts/docx/docs/17-revision-counting-appendix.mjs",
  "templates/rfp-guide.md",
  "templates/sw-rfp-spec.md",
  "templates/acceptance-criteria.md",
  "templates/contract-risk-checklist.md",
  "templates/change-request.md",
  "templates/revision-request.md",
  "templates/meeting-minutes.md",
  "templates/delivery-confirmation.md",
  "templates/defect-report.md",
  "templates/agreement-options.md",
  "templates/contract-parameter-sheet.md",
  "data/contract-input.sample.json",
  "data/contract-input.design.sample.json",
  "data/contract-input.ops.sample.json",
  "data/question-overlays.sample.json",
  "data/event-schema.sample.json",
  "docs/prd.md",
  "docs/mvp-goal-and-exit-criteria.md",
  "docs/completion-audit.md",
  "docs/estimate-flow-completion-audit.md",
  "docs/legal-references.md",
  "docs/legal-mcp-findings.md",
  "docs/reference-bibliography.md",
  "docs/question-overlay-map.md",
  "docs/event-schema.md",
  "docs/skill-first-plan.md",
  "docs/pr-review-checklist.md",
];

let ok = true;
for (const path of required) {
  if (!fs.existsSync(path)) {
    console.error(`missing: ${path}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("scopeguard-kr project files OK");
