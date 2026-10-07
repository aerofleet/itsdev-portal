# ITSDEV Portal

- 작업 범위: itsdev.kr 정적 콘텐츠 포털만. 기존 서비스 변경 금지.
- 2026-10-07 최신 사용자 요청: PULSEFORM 디자인 벤치마킹. 화면 구성·차콜/라임 테마는 docs/DESIGN-BENCHMARK.md가 v8의 홈 배치/색보다 우선한다. 콘텐츠 진실성·접근성·배포 범위는 유지한다.
- 최신 기준: docs/references/ITSDEV-design-v8.md, ITSDEV-memory-v8.md의 H-001/D-019, architecture (1).md, task.md.
- rules.md/PRD의 OCI·Nginx·Tunnel·VM·SSH 배포 조건은 최신 Workers 결정으로 대체한다.
- Astro static + Cloudflare Workers Static Assets. SSR/DB/API/auth 추가 없음.
- 첨부 원본 8개는 docs/references에 보존한다. 수정 결정은 별도 문서에 기록한다.
- 샘플은 로컬 디자인 검토 전용. 공개 build/RSS/sitemap에 포함하지 않는다.
- 실제 글·연락처·배포 권한이 확인되기 전 출시 완료로 표시하지 않는다.
- 검증: npm run check, npm run build, npm run verify, npm run deploy:check.
