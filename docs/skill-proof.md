# Skill Proof

스킬은 말로만 작성법을 안내하지 않고, 생성기와 공개 검증으로 입증한다.

## 입증 기준

| 항목 | 입증 방법 |
|---|---|
| 스킬 구조 | `.claude/skills/sw-contract-scopeguard/SKILL.md`, `.codex/skills/sw-contract-scopeguard/SKILL.md`가 존재 |
| Orchestrator 구조 | 최상단 `SKILL.md`가 문서별 recipe module을 라우팅 |
| 문서별 작성법 | `references/documents/{문서번호-이름}/recipe.md`에 문서별 입력·출력·검증 기준 존재 |
| HWP 생성 | `npm run audit:publish`에서 공개 샘플별 HWP 수와 압축 무결성 확인 |
| XLSX 생성 | `npm run audit:publish`에서 공개 샘플별 XLSX 수와 압축 무결성 확인 |
| 양식 필수 내용 | `scripts/audit-publish.mjs`의 generated content/workbook requirements 통과 |
| 공개 경계 | `npm run audit:publish`의 문자열 점검과 ignore 경계 점검 통과 |

## 로컬 검증 명령

```bash
npm run check
npm run audit:publish
python3 <skill-creator>/scripts/quick_validate.py .codex/skills/sw-contract-scopeguard
python3 <skill-creator>/scripts/quick_validate.py .claude/skills/sw-contract-scopeguard
```
