# Event Schema

이 문서는 서비스형으로 전환할 때 견적 row 작성 플로우를 개선하기 위해 수집할 수 있는 제품 분석 이벤트 스키마다.

현재 정적 MVP는 서버로 입력값을 전송하지 않는다. 브라우저에서는 `window.scopeguardEventLog`에 세션 중 이벤트를 보관하는 수준이다.

## 수집 원칙

- 계약서 원문, 개인정보, API 키, 계정정보는 수집하지 않는다.
- 견적 row의 원문 텍스트는 기본 수집 대상이 아니다.
- 분석 기본 단위는 row 수, 누락 필드, 선택 역할, 다운로드 여부, 수정 액션이다.
- 원문 기반 분석이 필요한 경우 별도 동의와 익명화 처리를 요구한다.

## 공통 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | string | 이벤트 이름 |
| `at` | ISO datetime | 발생 시각 |
| `role` | string | `buyer`, `supplier`, `neutral` |
| `rowCount` | number | 현재 견적 row 수 |
| `payload` | object | 이벤트별 추가 데이터 |

## 이벤트

| 이벤트 | 발생 조건 | payload |
|---|---|---|
| `role_selected` | 작성 관점 선택 | `{ role }` |
| `estimate_row_added` | row 추가 | `{ rowId }` |
| `estimate_row_selected` | row 선택 | `{ rowId }` |
| `estimate_row_updated` | row 필드 수정 | `{ rowId, field, source }` |
| `estimate_rows_exported` | JSON 내보내기 | `{ rowCount }` |
| `estimate_rows_imported` | JSON 불러오기 | `{ rowCount }` |
| `appendix_option_changed` | 선택 별첨 변경 | `{ key, enabled }` |
| `docx_bundle_downloaded` | ZIP 다운로드 | `{ rowCount }` |
| `contract_docx_downloaded` | 계약서 DOCX 다운로드 | `{ rowCount }` |
| `workbook_xlsx_downloaded` | XLSX 다운로드 | `{ workbookName, rowCount }` |

## 향후 분석 지표

| 지표 | 의미 |
|---|---|
| row 완성률 | 전제조건, 완수 조건, 테스트 조건, 부수 항목이 모두 채워진 row 비율 |
| 누락 필드 빈도 | 사용자가 가장 자주 비우는 필드 |
| 역할별 row 수 | 발주자/수급자/중립 관점별 평균 row 수 |
| 선택 별첨 사용률 | 디자인/UX, 수정횟수 산정 별첨이 실제로 선택되는 비율 |
| 다운로드 전 수정 횟수 | 계약문서 생성 전 작성 난이도 추정 |
| 오버레이 확인 후 수정률 | 문항 오버레이가 실제 작성 개선에 기여하는지 확인 |
