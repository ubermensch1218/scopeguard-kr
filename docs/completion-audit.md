# Completion Audit

## 목표

수급자/발주자가 견적 row를 입력하면, 각 row의 전제조건, 완수 조건, 테스트 조건, 부수 항목이 자동으로 계약서 조항과 부속서류에 반영되는 SW 외주계약 작성기 MVP를 만든다.

## Prompt-to-artifact checklist

| 요구사항 | 증거 |
|---|---|
| 수급자/발주자/중립 관점 선택 | `index.html`의 `data-role="buyer"`, `data-role="supplier"`, `data-role="neutral"` |
| 견적 row 기반 노코드 입력 UI | `index.html`의 `#estimate-rows`, `#add-estimate-row`; `assets/app.js`의 `renderEstimateRows()` |
| 문항별 “줄이는 분쟁” 오버레이 | `index.html`의 `#overlay-list`; `assets/app.js`의 `overlayItems`, `renderOverlayList()` |
| 누락 체크 | `index.html`의 `#writer-checks`; `assets/app.js`의 `renderWriterChecks()` |
| 계약서 초안 HWP | `output/03_SW_개발용역계약서_초안.hwp` |
| RFP/과업내용서 HWP | `output/02_RFP_과업내용서.hwp` |
| 검수기준표 HWP | `output/04_검수기준표.hwp` |
| 견적산정표 HWP/XLSX | `output/15_견적산정표.hwp`, `output/15_견적산정표.xlsx` |
| 수정요청서/변경요청서 등 부속서류 ZIP | `output/scopeguard_sw_contract_docs.zip` |
| 견적 row의 전제조건/완수 조건/테스트 조건/부수 항목 | `data/contract-input.sample.json`의 `estimate.rows[]` |
| 견적 row가 문서 생성에 반영 | `scripts/build-hwp-package.mjs`의 `estimateScopeRows()`, `estimatePaymentRows()`, `estimateRows()` |
| 웹 미리보기에서 표 렌더링 | `assets/app.js`의 `renderFallbackPreview()`, `parseMarkdownTableRow()` |
| 개발 후 각 입장 불편함과 종료 조건 제시 | `docs/mvp-goal-and-exit-criteria.md` |

## Verification commands

```bash
node -e "JSON.parse(require('fs').readFileSync('data/contract-input.sample.json','utf8')); JSON.parse(require('fs').readFileSync('data/question-overlays.sample.json','utf8')); console.log('json ok')"
node --check assets/app.js
node --check scripts/build-hwp-package.mjs
npm run check
npm run build:docs
for f in output/*.hwp; do rhwp info "$f" >/dev/null || exit 1; done
for f in output/*.xlsx; do unzip -t "$f" >/dev/null || exit 1; done
unzip -t output/scopeguard_sw_contract_docs.zip >/dev/null
```

## Residual risks

| 리스크 | 상태 |
|---|---|
| 웹 ZIP 다운로드 클릭 자체의 자동 E2E 검증 부족 | Playwright 콘솔과 정적 생성물로 검증했지만 다운로드 클릭 자동 검증은 다음 단계 |
| 모바일 표 입력이 길고 무거움 | 가로 스크롤로 동작하나 row별 편집 패널이 필요 |
| 견적 row 입력 로그 수집 | 현재 정적 MVP는 서버 수집 없음. 서비스형 전환 시 별도 이벤트 스키마와 익명화 기준 필요 |
| 법률 문구 최종 적합성 | 이 프로젝트는 법률 자문이 아니며 전문가 검토 필요 |
| 전달 형식 제한 | HWP와 XLSX만 전달 대상으로 유지 |
