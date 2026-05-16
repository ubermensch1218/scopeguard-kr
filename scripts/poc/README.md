# PoC: rhwp(Rust) → kordoc(npm) 백엔드 치환

## 동기

현재 `npm run build:docs`는 [scripts/build-hwp-package.mjs](../build-hwp-package.mjs)의
`writeHwpDocuments()`에서 임시 Rust 프로젝트를 만들어 `cargo run`으로 HWP를 생성합니다.

이 방식의 진입장벽:

| 사용자가 갖춰야 할 것 | 비용 |
|---|---|
| Rust toolchain (`cargo`) | 설치 ~600MB |
| rhwp 레포 별도 clone | `RHWP_REPO` env 또는 `../rhwp` 위치 강제 |
| 첫 `cargo build` | 수십 초 ~ 분 단위 |
| `cargo run` 매 실행 | 수 초 |

대안으로 **[kordoc](https://www.npmjs.com/package/kordoc)** (HWP/HWPX/PDF/XLSX/DOCX 파서·생성기, MIT)을 사용하면
`npm i kordoc` 한 줄로 끝나고, 출력은 `.hwp` 대신 `.hwpx`(한컴오피스 권장 표준 포맷, 동일 호환)가 됩니다.

## 결과

```
input data/contract-input.sample.json
created 20 hwpx files in output_kordoc/ (33ms)
```

자동 검증 4종 모두 통과 (kordoc 2.8.x 기준):

| 검증 스크립트 | 항목 | 결과 |
|---|---|---|
| `verify-signature.mjs` | HWPX 시그니처 (mimetype STORE, `application/hwp+zip`) | 20/20 |
| `verify-roundtrip.mjs` | `kordoc.parseHwpx` 역파싱 + 제목 보존 | 20/20 |
| `verify-theme.mjs` | rhwp와 동일한 색상 팔레트가 `header.xml`에 등장 | 20/20 |
| `verify-theme.mjs` | 표 첫 행이 헤더 charPr 사용 (`charPrIDRef=9`) | 20/20 |

## 사용

PoC는 메인 빌더에 영향이 없도록 `scripts/poc/` 디렉토리에 격리되어 있고,
이 PR은 `package.json`을 건드리지 않습니다. 검증하려면 일단 kordoc을 로컬에 설치:

```bash
# kordoc 2.8.0 publish 후
npm install --no-save kordoc

# 또는 2.8.0 release 전 (chrisryugj/kordoc#31 head 기준)
git clone https://github.com/chrisryugj/kordoc.git ../kordoc
cd ../kordoc && git checkout feat/hwpx-theme-options && npm install && npm run build && npm pack
cd -
npm install --no-save ../kordoc/kordoc-2.7.2.tgz
```

그 다음:

```bash
node scripts/poc/build-kordoc-package.mjs           # → output_kordoc/*.hwpx (20개)
node scripts/poc/verify-signature.mjs               # HWPX 시그니처
node scripts/poc/verify-roundtrip.mjs               # round-trip
node scripts/poc/verify-theme.mjs                   # 색상 적용
node scripts/poc/dump-sample.mjs 00_참고문헌.hwpx    # 본문 육안 확인
```

다른 샘플:

```bash
node scripts/poc/build-kordoc-package.mjs --input data/contract-input.design.sample.json
node scripts/poc/build-kordoc-package.mjs --input data/contract-input.ops.sample.json
```

## 한컴오피스 수동 검증 (자동 검증으로 못 잡는 부분)

`output_kordoc/`의 .hwpx 파일을 한컴오피스(또는 뷰어, 폴라리스, LibreOffice 한컴 확장)로 열어:

- 표가 깨지지 않고 행/열 정렬되어 보이는가
- 한글이 □(두부) 없이 표시되는가
- 헤딩 레벨별 색상 위계가 보이는가 (`#17365D` h1, `#1F4E79` h2/표 헤더, `#5C667A` 인용문)
- 첫 행 셀이 굵게 보이는가

## 색상 팔레트 (rhwp 백엔드와 동일)

[build-kordoc-package.mjs](build-kordoc-package.mjs)의 `SCOPEGUARD_THEME`는
[build-hwp-package.mjs:236-260](../build-hwp-package.mjs#L236)의 `apply_line_style`이
지정하는 색상과 일치시켰습니다.

| 요소 | rhwp 백엔드 | kordoc 백엔드 |
|---|---|---|
| Title | `#17365D` | `#17365D` (h1) |
| Heading1 | `#1F4E79` | `#1F4E79` (h2) |
| Quote | `#5C667A` italic | `#5C667A` italic |
| Body | `#222222` | `#222222` |
| Cell header | `#1F4E79` bold | `#1F4E79` bold |
| Cell body | `#111111` | `#222222` |

**남아 있는 시각 차이**:

- **셀 음영(배경색)** 미적용 — kordoc 1차 PR scope에선 텍스트 색상만 옵션화. 셀 `borderFill.fillInfo` 처리는 후속 PR.
- **글꼴 크기** 미세 차이 — rhwp는 인치 단위(`fontSize: 1700`), kordoc은 charPr `height` HWPUnit. 정밀 매칭은 후속 PR.
- **줄 간격** 일부 차이 — rhwp의 `lineSpacing` 세팅과 kordoc 기본값 차이.

## 본 빌더 통합 시 영향

PoC 단계라 본 빌더(`scripts/build-hwp-package.mjs`)는 안 건드렸습니다.
통합 시 영향 받는 영역:

1. **파일 확장자 `.hwp` → `.hwpx`**: 한컴 권장 포맷이라 사용자 이득이지만 `.hwp` 박힌 곳 갱신 필요
   - [scripts/output-bundles.mjs](../output-bundles.mjs) `phaseBundles[].files`
   - [scripts/audit-publish.mjs](../audit-publish.mjs) 검증 단계
   - README.md `output/` 트리

2. **`build-rhwp-lawyer-package.mjs`도 동일 패턴** — 같은 어댑터로 치환 가능

## 결정 요청

이 PR은 **PoC 스크립트 추가만** 합니다. 본 빌더 치환·삭제는 별도 PR로 분리합니다.

메인테이너 결정 필요:

- 출력 포맷을 `.hwpx`로 마이그레이션할지
- rhwp 백엔드를 유지하고 kordoc은 옵션으로 둘지 (`--backend=kordoc`)
- 셀 음영 처리(후속 PR)가 필요한지
