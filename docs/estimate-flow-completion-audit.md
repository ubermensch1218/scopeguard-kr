# Estimate Flow Completion Audit

## 목표

견적 row 작성기를 발주자 제출용 견적서, 계약서 자동 반영, 제품 분석용 입력 로그까지 이어지는 작성 플로우로 고도화한다.

## Prompt-to-artifact checklist

| 요구사항 | 증거 |
|---|---|
| row별 편집 패널 제공 | `index.html`의 `#selected-row-editor`, `assets/app.js`의 `renderSelectedRowEditor()` |
| 견적 row JSON 내보내기 | `index.html`의 `#export-estimate-rows`, `assets/app.js`의 `exportEstimateRowsJson()` |
| 견적 row JSON 불러오기 | `index.html`의 `#import-estimate-rows`, `#import-estimate-rows-file`, `assets/app.js`의 `importEstimateRowsJson()` |
| 발주자 제출용 견적서 미리보기 | `index.html`의 `#buyer-estimate-output`, `assets/app.js`의 `buildBuyerEstimateMarkdown()` |
| 계약서/RFP/검수표 반영 위치 하이라이트 | `index.html`의 `#reflection-map`, `assets/app.js`의 `renderReflectionMap()` |
| 누락 항목별 수정 버튼 | `assets/app.js`의 `renderWriterChecks()`, `focusPanelField()` |
| 제품 분석용 입력 로그 | `assets/app.js`의 `trackEvent()`, `window.scopeguardEventLog`, `docs/event-schema.md` |
| 이벤트 스키마 샘플 | `data/event-schema.sample.json` |
| 기존 계약문서 ZIP 유지 | `npm run build:docs`로 기본 17개 DOCX, 14개 XLSX, ZIP 생성 |

## Verification commands

```bash
node --check assets/app.js
node --check scripts/build-docx-package.mjs
node -e "JSON.parse(require('fs').readFileSync('data/event-schema.sample.json','utf8')); console.log('event json ok')"
npm run check
npm run build:docs
for f in output/*.docx output/*.xlsx; do unzip -t "$f" >/dev/null || exit 1; done; unzip -t output/scopeguard_sw_contract_docs.zip >/dev/null
```

## Browser verification

- `http://localhost:4173` Playwright 접속
- Desktop viewport console errors: 0
- Mobile viewport console errors: 0

## 남은 개선 여지

| 항목 | 이유 |
|---|---|
| JSON 내보내기/불러오기 E2E 클릭 테스트 | 현재는 문법, DOM, 브라우저 로드 검증까지 수행 |
| 이벤트 서버 수집 | 현재 MVP는 정적 앱이므로 `window.scopeguardEventLog`까지만 구현 |
| row별 패널 중심 모바일 레이아웃 | 현재는 동작 가능하나 표와 패널이 모두 있어 모바일 입력량이 많음 |
