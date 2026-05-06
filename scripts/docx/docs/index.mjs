import { createDocxContext } from "../helpers.mjs";
import { build as reference } from "./00-reference.mjs";
import { build as inputSummary } from "./01-input-summary.mjs";
import { build as rfpSpec } from "./02-rfp-spec.mjs";
import { build as contractDraft } from "./03-contract-draft.mjs";
import { build as acceptanceCriteria } from "./04-acceptance-criteria.mjs";
import { build as revisionRequest } from "./05-revision-request.mjs";
import { build as changeRequest } from "./06-change-request.mjs";
import { build as meetingMinutes } from "./07-meeting-minutes.mjs";
import { build as deliveryConfirmation } from "./08-delivery-confirmation.mjs";
import { build as defectReport } from "./09-defect-report.mjs";
import { build as paymentSchedule } from "./10-payment-schedule.mjs";
import { build as rightsHandover } from "./11-rights-handover.mjs";
import { build as opsHandover } from "./12-ops-handover.mjs";
import { build as privacySecurity } from "./13-privacy-security.mjs";
import { build as agreementOptions } from "./14-agreement-options.mjs";
import { build as estimateSheet } from "./15-estimate-sheet.mjs";
import { build as designUxAppendix } from "./16-design-ux-appendix.mjs";
import { build as revisionCountingAppendix } from "./17-revision-counting-appendix.mjs";

const builders = [
  reference,
  inputSummary,
  rfpSpec,
  contractDraft,
  acceptanceCriteria,
  revisionRequest,
  changeRequest,
  meetingMinutes,
  deliveryConfirmation,
  defectReport,
  paymentSchedule,
  rightsHandover,
  opsHandover,
  privacySecurity,
  agreementOptions,
  estimateSheet,
  designUxAppendix,
  revisionCountingAppendix,
];

export function buildDocuments(input) {
  const ctx = createDocxContext(input);
  return builders.flatMap((builder) => builder(ctx)).filter(Boolean);
}
