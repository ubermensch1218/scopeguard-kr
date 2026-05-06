# Publish Boundary

이 문서는 GitHub에 올릴 것과 로컬에만 둘 것을 구분하기 위한 기준입니다.

## 공개 대상

아래 파일은 저장소에 올려도 되는 영역입니다.

| 영역 | 이유 |
|---|---|
| `README.md`, `CONTRIBUTING.md`, `LICENSE` | 프로젝트 설명과 기여 기준 |
| `index.html`, `assets/` | 정적 입력 UI |
| `scripts/` | DOCX 생성기와 문서별 빌더 |
| `templates/` | 공개 가능한 문서 템플릿 |
| `docs/` | PRD, 데이터 모델, 참고문헌, 공개 검토 문서 |
| `samples/` | 익명화된 표본 |
| `data/*.sample.json` | 공개용 샘플 입력값 |
| `.claude/skills/sw-contract-scopeguard/` | Claude Skill 초안 |
| `.codex/skills/sw-contract-scopeguard/` | Codex Skill 초안 |

## 비공개 대상

아래 파일은 `.gitignore`로 막고 로컬에만 둡니다.

| 영역 | 이유 |
|---|---|
| `output/` | 생성 DOCX/ZIP 산출물 |
| `private/`, `.private/`, `local/` | 실계약, 실고객, 내부 메모 |
| `data/contract-input.json` | 실제 프로젝트 입력값 |
| `data/*.local.json`, `data/*.private.json` | 로컬 또는 비공개 입력값 |
| `data/uploads/`, `data/raw/` | 업로드 원본 문서 |
| `.env*`, `.dev.vars`, `.wrangler/` | 환경변수와 배포 상태 |
| `.codex/sessions/`, `.codex/state/`, `.codex/logs/`, `.omx/` | 로컬 실행 상태 |
| `*secret*`, `*credentials*`, `*.pem`, `*.key`, `*.p12` | 접속 정보 가능성이 높은 파일 |
| `*.local.docx`, `*.private.docx`, `*.local.hwpx`, `*.private.hwpx` | 비공개 문서 파일명 규칙 |

## 올리기 전 점검

```bash
npm run check
npm run audit:publish
npm run build:docs
```

`output/`은 생성 검증에는 쓰지만 저장소에는 올리지 않습니다. 공개용 DOCX 샘플이 필요하면 `samples/` 아래에 익명화된 별도 샘플로 추가합니다. `npm run audit:publish`는 공개용 샘플 3종을 모두 생성해 문서 무결성, 선택 별첨 포함 여부, 견적 row 연결, 민감 문자열 포함 여부를 확인합니다.
