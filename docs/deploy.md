# 배포

## Cloudflare Pages

1. GitHub에 `ubermensch1218/scopeguard-kr` 저장소를 만든다.
2. Cloudflare Pages에서 저장소를 연결한다.
3. Framework preset은 `None`으로 둔다.
4. Build command는 비운다.
5. Output directory는 `/`로 둔다.

정적 파일만 있으므로 별도 빌드가 필요 없습니다.

## 자체 도메인 하위 경로

`index.html`, `assets/`, `templates/`, `docs/`를 정적 호스팅 경로에 업로드하면 됩니다.

## 향후 서버 기능

서버가 필요한 경우:

- HWP/PDF 업로드 후 텍스트 추출
- korean-law-mcp 기반 법령/행정규칙/공개문서 조회
- kordoc 기반 HWP 생성
- 익명화된 리스크 패턴 저장
- 변호사 검토 워크플로우
