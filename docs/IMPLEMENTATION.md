# 포털 구현 상태 · 2026-10-07

## 2026-10-09 · Directus CMS 정적 발행 연결 준비

- `scripts/sync-directus.mjs`가 Directus 공개 콘텐츠를 임시 Markdown으로 동기화하고 Astro 정적 컬렉션에 공급한다. 앱 런타임 요청이나 DB 연결은 없다.
- GitHub Actions는 `DIRECTUS_CONTENTS_ENABLED=true`일 때만 동기화한다. API/Access 자격증명은 GitHub Secrets에서 주입하며 콘텐츠 파일은 저장소에 커밋하지 않는다. 활성화했지만 기본 API 자격증명이 없으면 빌드를 실패시킨다.
- 합격 기준: 공개 상태·발행일이 유효한 문서만 RSS/sitemap/정적 HTML에 포함, slug/documentId 중복 0건, 비밀값 출력 0건.
- 아직 미완료: Directus collection/최소 읽기 role, Cloudflare Tunnel/Access, GitHub Secrets/Variables 구성 및 실제 CMS 결과의 CI 검증. `docs/DIRECTUS.md`에 계약과 순서를 기록했다.
- CMS는 OCI + HeatWave에 남고, 포털 정적 자산만 Cloudflare Workers로 배포한다.

## 최신 추가 · 접근성 자동 검사와 테마 버튼

- 사용자 요청에 따라 해/달 버튼으로 테마 전환을 제공하고 모션 버튼을 제거했다. 키보드와 저장된 테마, OS 모션 감소 설정을 유지한다.
- T-208 보강: `npm run test:a11y` 및 CI 검사/보고서 14일 보관을 추가했다. 평가셋은 검증용 콘텐츠의 13개 경로 × light/dark × 320/1440px = 52개 조합이다. details는 모두 펼쳐 검사한다. WCAG A/AA 태그의 자동 검사이며 실제 Safari/Firefox·실기기·스크린리더 검수와 다르다.
- 목표 KPI/OKR: 읽기·탐색 접근성 결함 예방. 합격 기준은 자동 검출 위반 0건 및 가로 넘침 0건. Before: axe 검사 없음 → After: 52개 조합 검사와 JSON 보고서 보존. 유입 효과와 사용자 과업 성공률은 미측정이다.
- 판정 보류 검토에서 코드 블록의 aria-label에 대응하는 역할 누락을 확인해 `role="region"`을 추가했다. Markdown 플러그인 변경 후 기존 검증용 콘텐츠 캐시에 이전 HTML이 남아 `.codex/content-cache`를 정리하고 재빌드했다. 향후 렌더링 플러그인 변경 시 캐시 반영 여부를 확인해야 한다.
- 서비스 소개의 기술 목록에도 `role="group"`을 추가해 접근성 이름의 역할 누락을 수정했다. SVG 도판의 겹친 배경 위 글자 대비는 자동 판정 보류로 남아 수동 검수해야 한다. 이 항목을 제외하거나 통과로 바꾸지 않는다. 전체 접근성/출시 완료를 의미하지 않는다.
- `npm run check`: 43파일 오류/경고/힌트 0. `build`, `verify` 통과: 공개 14페이지, 링크 265개, 원본 SHA 8/8, CSS gzip 7,909B, JS gzip 561B. `deploy:check`: 40자산 dry-run 통과. 원격 CI·배포는 실행하지 않았다.
- 검사 방법 참조: [Playwright 접근성 검사](https://playwright.dev/docs/accessibility-testing). 보고서: `.codex/accessibility-results/**/axe-report.json`.

## 최신 추가 · 공유 이미지

- 차콜/라임 브랜드 PNG(1200×630, 38,822 bytes)를 추가하고 공통 Base에 OG 이미지·크기·alt·locale/site name 및 Twitter large-image 메타데이터를 연결했다. 글별 제목/설명/날짜는 기존 실제 콘텐츠 필드를 사용한다. 이미지 자체는 공통 브랜드 카드다.
- 목표 KPI/OKR: 공유 시 브랜드와 문서 정보 제공. 평가셋은 공개 HTML 14개와 PNG 1개이며, 합격 기준은 누락 0건·PNG 300 KB 이하이다. Before: 공유 이미지 미연결 → After: 14/14 연결, 38,822 bytes. 외부 플랫폼 실제 공유/유입 효과는 미측정.
- `npm run assets:social`, `npm run check`(40파일, 오류/경고/힌트 0), `npm run build`, `npm run verify` 통과. 원본 SHA 8/8, 링크 265개, CSS gzip 7,708 bytes, JS gzip 606 bytes.
- 브라우저 검사는 기존 4323 미리보기 충돌을 종료하고 재실행했다. `npm run test:e2e` 12/12 통과. `npm run deploy:check`는 assets 40개 dry-run 통과. 실제 배포 없음.
- 카드 PNG를 직접 열어 문구·도형·여백을 확인했다. 재생성 명령은 `npm run assets:social`; 생성 코드는 빌드/클라이언트 번들에 포함하지 않는다. 실제 글·연락처·정책·계정/도메인 확정과 출시 검증은 계속 남아 있다.

## 최신 상태 · 목록/상세/콘텐츠 검증

이 섹션이 아래 초기 구현 수치를 대체한다. 화면 기준은 PULSEFORM 벤치마킹 이후의 차콜/라임 구성이다.

- 목록·분류: 공통 12개 페이지네이션, 선택 분류/현재 페이지 표시, 후속 페이지 canonical/sitemap 연결.
- 상세: 표제 정보·발행/수정일·주제 도판·H2/H3 목차·적용 환경·검증 근거·개정·관련 글 최대 3개. 긴 코드/표는 키보드 접근 가능한 자체 스크롤 영역이다.
- 발행: 미래 날짜·draft·sample 제외. 중복 documentId, 숫자/예약 slug, 역전된 수정일, 비HTTPS canonical을 거부한다. 외부 canonical 글은 로컬 sitemap에서 제외한다.
- 검증용 14편과 제외 대상 3편은 `.codex/content-fixtures/` 및 `.codex/content-dist/`에서 격리한다. 모든 검증 페이지는 noindex와 검증용 배너를 표시하며 공개 `dist/`에는 없다.
- KPI/OKR: 독자의 정적 읽기·탐색 가능성. 목표는 링크 오류 0건, 페이지 가로 넘침 0건, 검증용 콘텐츠의 공개 빌드 노출 0건. 방문 전환 효과/운영 성능 개선은 미측정.
- 평가셋: 14편 전체 목록 12+2, 인프라 12+1, RSS 14항목, 개정 0회/2회, 긴 제목/URL/코드/6열 표, 320/390/768/1440px, JS off, 테마, 키보드 표 스크롤, 확대 텍스트. 텍스트 확대 검사는 전체 브라우저 200% 확대와 다르다.
- Before: 공개 글 0편 조건만 검증, sitemap에 목록 2페이지 이후 URL 없음.
- After: `npm run check` 39파일 오류/경고/hint 0건, `npm run test:content` 12/12 및 중복 documentId 빌드 차단, `npm run test:e2e` 12/12. `npm run build` 공개 14페이지, `npm run verify` 내부 링크 265개 오류 0건·CSS gzip 7,708B·자체 JS 606B·원본 해시 8/8.
- 상세/목록 캡처: `.codex/*-article.png`, `*-article-light.png`, `*-article-list.png`. 실제 글은 아직 0편이다. 글 원본과 문의 연락처는 사용자에게 요청했으며, 미확정 상태에서 임의로 채우지 않는다.
- CI에 동일 콘텐츠/브라우저 검증을 추가했다. 원격 저장소/Actions 실행/공개 배포는 아직 수행하지 않았다.

다음은 실제 글·연락처·정책 확정, 실제 글 기반 OG 이미지/폰트 전체 글리프, 실기기/스크린리더/성능 및 Workers 계정/도메인/배포 검증이다. 작성 절차는 `docs/CONTENT.md`를 따른다.

## 적용 결정

- 로컬 프로젝트 이름은 `itsdev-portal`. 콘텐츠 대표 원본은 `src/content/articles/`. 원격 저장소와 기존 Tistory 글의 canonical은 미확정.
- 첨부 원본 8개를 `docs/references/`로 이동했으며 `.codex/source-manifest.json`의 SHA-256으로 무결성을 검사한다.
- 원본 rules/PRD에 남은 Nginx·Tunnel·VM·SSH·RAM 조건은 architecture v5 및 memory H-001의 Workers 결정으로 대체한다. 원본 문서는 수정하지 않는다.
- D-019의 여백·둥근 도판·Cobalt/Redline과 자체 폰트를 재사용한다. 디자인 시안은 로컬 개발에서만 제공한다.
- Astro 7.3.6 고정. Windows 네이티브 로딩 차단 시 공식 WASM 선택 의존성 사용. Astro 6 호환성 시도는 npm audit의 미수정 취약점 확인 후 폐기했다.
- Wrangler 4.148.0의 miniflare/sharp를 0.35.5로 override. audit 0건 확인. 배포 dry-run 성공.
- Workers 이름은 가칭이다. `wrangler.jsonc`에 실제 Custom Domain route는 아직 등록하지 않았다.

## 구현한 기반

T-003 로컬 폴더/콘텐츠 경계, T-201B 컴포넌트/테마/모션, T-202 기본 정적 경로, T-204 schema/RSS/canonical/sitemap, T-205 assets/404 구성의 초기 구현이다. 이 기록은 해당 Task 전체의 완료 선언이 아니다.

문서번호 중복은 빌드 시 검사하며 draft/sample은 상세·목록·RSS에서 제외한다. 검증 완료 상태에는 확인 날짜와 근거 참조를 요구한다. REV는 명시적 배열이며 개정 없는 글에는 표를 출력하지 않는다. 광고와 분석 스크립트는 없다.

문의/개인정보/이용 안내는 준비 상태와 미확정 항목을 표시한다. 연락처나 정책을 임의로 확정하지 않으며 noindex로 두었다. 배포 전 저자 검수와 운영 설정 확인이 필요하다.

## 검증 목표와 평가셋

- OKR 연결: 독자가 근거를 읽고 관련 기록/공개 서비스로 이동할 수 있는 포털 기반 확보. 방문/전환 성과는 미측정.
- 목표 KPI/합격 기준: 원본 해시 8/8 일치, 빌드 내부 링크 오류 0건, 공개 샘플/초안 노출 0건, 320px 가로 넘침 0건, 자체 JS gzip ≤8KB, CSS gzip ≤18KB.
- 평가셋: 생성된 14개 HTML, 내부 링크/자산 209개, 원본 8개. Chromium desktop/320px에서 탐색·theme·motion·JS off·reduced motion·없는 URL/참조문서/draft 접근을 검사한다.
- Before: 독립 HTML 시안과 문서만 존재. Astro 앱·빌드·정적 경로 없음.
- After: `npm run check` 29개 파일 오류/경고/hint 0건, `npm run build` 14페이지 성공, `npm run verify` 오류 0건, CSS 4,788B/JS 602B gzip. inline JS도 예산에 포함한다.
- `npm run deploy:check`: Static Assets 38파일, 설정 dry-run 성공. 실제 Workers HTTP/헤더/캐시/도메인/rollback 검증은 아니다.
- Playwright Chromium 6/6 통과. 320px/desktop 홈 캡처를 직접 확인했으며 겹침·가로 넘침은 관찰되지 않았다. Astro preview 종료 지연은 프로젝트 전용 `preview stop` teardown으로 정리한다.
- 실행 기록: `.codex/verification.json`, Playwright 테스트 소스와 `.codex/desktop-home.png`, `.codex/mobile-home.png`. npm audit 0건은 의존성 조회 시점의 결과다.

## 미완료 및 다음 순서

1. T-001/104/105: Cloudflare 계정·zone·프로젝트/권한·기존 루트 DNS 확인. 사용자 결정 이후 itsdev.kr Custom Domain만 적용.
2. T-002/401/402: 저자 검수된 실제 대표 글 5편과 서비스 소개를 확보. 현재 공개 글은 0편이며 empty state를 표시한다. 미측정 성과를 발행하지 않는다.
3. T-203: 공개 연락처와 실제 데이터 처리·보관/권리 안내 확정.
4. T-204: 실제 콘텐츠 기반 OG 1200×630 생성, 긴 제목/표/코드/URL·개정 0회/다회·13편 이상 페이지네이션 평가셋 보강. 상세 템플릿은 실제 글로 검수 전이다.
5. T-207/208: Safari/Firefox·실기기·스크린리더·200%·대비·폰트 전체 글리프/CLS 검사. 대표 3페이지 모바일 lab 각 3회 LCP/CLS, field INP는 미측정이다.
6. T-206/504: 원격 레포와 Secrets 확정 후 CI 배포/버전 기록·smoke·이전 버전 rollback 리허설. 현재 CI는 검증/artifact만 구성했으며 실행 전이다.

첨부 로드맵 체크박스는 그대로 유지한다. 원본 폰트 subset은 해당 시안 글리프용이므로 실제 글 발행 전에 갱신하고 첫 화면 120KB 예산을 재검사한다.

참조: [Astro 7 공식 컴파일러 안내](https://astro.build/blog/astro-7/), [Astro 콘텐츠 컬렉션](https://docs.astro.build/en/guides/content-collections/), [Workers SSG/404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/).
