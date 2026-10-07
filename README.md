# ITSDEV Engineering Fieldnotes

`itsdev.kr` 콘텐츠 포털. Astro static + Cloudflare Workers Static Assets.

현재 화면은 사용자 제공 PULSEFORM을 벤치마킹한 차콜/라임 테마와 콘텐츠 카드 구성입니다. [디자인 적용 기준](docs/DESIGN-BENCHMARK.md)에 원본 v8에서 바뀐 항목을 기록했습니다.

## 실행

Node 24.13.0 이상을 사용합니다.

```powershell
cd C:\Users\aerof\itsdev-portal
npm ci
npm run dev
```

- 홈: http://127.0.0.1:4321/
- 첨부 v8 시안: http://127.0.0.1:4321/design-preview.html (개발 서버에서만 제공)
- 원본 8개: `docs/references/` — 다운로드 폴더에서 이동, SHA-256 보존 확인.
- 공개 글 원본: `src/content/articles/` Markdown. 현재 템플릿 한 편은 draft/sample로 제외됩니다.

이 Windows 환경에서 Astro 네이티브 컴파일러가 OS 정책에 차단되면 `npm run setup:windows`를 실행합니다. 공식 선택 의존성 `@astrojs/compiler-binding-wasm32-wasi`의 wasm32 CPU 메타데이터 때문에 npm의 플랫폼 검사를 건너뛰어 설치하는 명령입니다. OS 보안 설정과 node_modules 코드는 변경하지 않습니다. 런타임의 WASI experimental 안내는 남습니다.

## 검증

```powershell
npm run check
npm run build
npm run verify
npm run test:e2e
npm run test:content
npm run deploy:check
```

Playwright Chromium이 없는 환경에서는 `npx playwright install chromium`을 먼저 실행합니다. 테스트는 4322 포트를 사용합니다.

콘텐츠 검증은 별도 4323 포트와 `.codex/content-dist/`에서 실행합니다. 검증용 글 14편과 제외 대상 3편으로 페이지네이션·목차·개정·코드/표·초안 제외를 확인하며 기본 `dist/`에는 포함하지 않습니다.

완성된 목록/상세 화면을 로컬 샘플로 보려면:

```powershell
npm run build:content
npm run preview:content
```

http://127.0.0.1:4323/articles/ 에서 확인할 수 있습니다. 화면 상단에 검증용 표시가 있고 모든 페이지는 noindex입니다. 종료 명령은 `node scripts/content-fixtures.mjs stop`입니다. 실제 글 작성 규칙은 [콘텐츠 가이드](docs/CONTENT.md)를 참고하세요.

## 현재 범위

접근성 자동 검사: 실행 중인 미리보기를 종료한 뒤 `npm run test:a11y`를 실행합니다. 검증용 콘텐츠 13개 경로 × 밝게/어둡게 × 320/1440px의 52개 조합을 검사하며 결과와 수동 확인 대상은 `.codex/accessibility-results/**/axe-report.json`에 저장합니다. 자동 검사 통과는 스크린리더·실기기 검수를 대체하지 않습니다.

홈, 목록/분류/12개 페이지네이션, Markdown 상세 템플릿/목차/개정/관련 글, 서비스 소개, 신뢰 페이지 초안, RSS/sitemap/404와 Workers 설정을 구성했습니다. 원본 샘플 글은 공개 빌드에서 제외합니다. 디자인 원본의 도판과 폰트를 재사용하며 폰트 라이선스는 `public/fonts/OFL.txt`에 보존합니다.

실제 글·연락처·정책·Cloudflare 계정/도메인 확인 전입니다. 기본 `deploy` 명령은 출시 미충족 상태를 알리고 종료합니다. 아직 원격 저장소 생성, 공개 배포, DNS 변경은 하지 않았습니다. 자세한 근거와 남은 작업은 [구현 상태](docs/IMPLEMENTATION.md)를 참조하세요.
