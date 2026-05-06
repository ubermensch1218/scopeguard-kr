# 계약 이행 데이터 모델 초안

MVP는 RDB를 기본으로 두고 요청-조항-증거 관계만 edge 테이블로 표현합니다.

## 핵심 테이블

```text
projects
contracts
contract_clauses
requirements
screens
deliverables
acceptance_criteria
messages
requests
approvals
meetings
evidence
risk_flags
request_clause_links
evidence_fact_links
```

## 요청 타입

```text
INFO
MATERIAL
APPROVAL
REJECTION
DEFECT
MINOR_REVISION
CHANGE_REQUEST
SCOPE_DISPUTE
SCHEDULE
PAYMENT
MEETING_REQUEST
```

## 예시 룰

```text
IF 요청이 승인된 PRD 또는 화면설계서와 충돌
THEN CHANGE_REQUEST 후보

IF 계약 범위 기능이 작동하지 않고 검수기준을 충족하지 못함
THEN DEFECT

IF 문구, 색상, 라운딩, 간격 조정이고 화면 구조 변경이 없음
THEN MINOR_REVISION

IF 산출물 제출 후 5영업일 내 반려 없음
THEN APPROVAL_DEEMED

IF 대면회의 잔여 횟수 = 0
THEN PAID_MEETING_REQUIRED
```

