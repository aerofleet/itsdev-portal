# Rules · itsdev.kr Portal Standards

> v4 · 2026-10-07 · MUST=출시 차단, SHOULD=사유 기록 후 예외 가능

## 1. 적용 범위 MUST

본 규칙은 itsdev.kr의 신규 콘텐츠 포털에만 적용한다. 기존 서브도메인들은 이미 운영 중이며 해당 서비스의 API·DB·인증·라우팅·호스팅·디자인을 본 프로젝트의 규칙으로 변경하지 않는다. 서비스 소개와 외부 링크는 포털 콘텐츠로만 관리한다.

PRD=제품, design=포털 UI, architecture=포털 구성, task=포털 실행 증거, memory=결정 이력이다. 서버 설정이나 운영 상태를 문서 편집만으로 완료 처리하지 않는다.

## 2. 포털 인프라 MUST

- 포털 origin은 loopback에 bind하며 공개 인바운드 포트를 추가하지 않는다. 포털 hostname은 itsdev.kr로 한정한다.
- 기존 listener와 ingress를 유지한다. 포트가 사용 중이면 포털의 다른 빈 loopback 포트를 선택한다. 공유 firewall/NSG/zone 설정을 초기화하지 않는다.
- 공개 포털에 Access 로그인을 걸지 않는다. 배포 접속은 별도 인증 경로와 최소 권한 deploy 계정으로 보호한다.
- HTTPS는 포털 edge와 Tunnel 구조를 기준으로 한다. 직접 HTTPS origin은 인증서 검증을 유지한다.
- HSTS includeSubDomains/preload와 wildcard DNS/ingress는 이번 작업에서 추가하지 않는다. 캐시·redirect 규칙은 itsdev.kr 조건으로 한정한다.
- 포털에 JVM·DB·SSR 런타임을 도입하지 않는다. Astro 빌드는 CI에서 수행한다.
- 공유 노드의 swap·OS 업데이트·수집 agent 변경을 포털 필수 작업으로 강제하지 않는다. 호스트 변경이 필요하면 영향도와 별도 범위를 먼저 기록한다.

## 3. 배포와 권한 MUST

배포 계정은 포털 경로만 수정 가능하게 제한한다. SSH key·host key를 검증하고 cache purge token은 필요한 권한만 부여한다. 서비스 credential·token·비밀값은 Git/정적 bundle/로그에 넣지 않는다.

배포는 SHA release·원자적 current 전환·동시 실행 lock·포털 smoke check·이전 release rollback을 포함한다. purge는 변경된 포털 URL 목록으로 수행한다. 기존 서비스 배포·권한·설정 파일은 수정하지 않는다.

공유 Nginx 설정은 포털 vhost 추가로 한정하고 `nginx -t` 후 적용한다. 배포와 rollback은 정적 파일 경로 전환을 우선한다.

## 4. 프론트와 디자인 MUST

- Astro static. 핵심 읽기·목록 탐색은 JS 없이 동작한다. 자체 공통 UI gzip ≤8KB, 광고/CMP는 별도 계측한다.
- design.md의 masthead·Decision strip·Fieldnote index로 편집 위계를 구현한다. 의미 없는 숫자·가짜 운영 지표 금지.
- 토큰과 컴포넌트는 포털에 적용한다. 기존 서비스 화면의 토큰 공유·헤더·복귀 링크 개편을 요구하지 않는다.
- 이미지 width/height 또는 aspect-ratio, LCP 이미지 lazy 금지, 다이어그램은 접근 가능한 SVG 또는 이미지+설명을 제공한다.
- 텍스트 대비 4.5:1, 의미 있는 UI 3:1, focus-visible·skip link·heading 순서·키보드·reduced motion·320px reflow를 검수한다.
- 기존 API/Internal 링크와 draft를 포털의 공개 탐색·sitemap·RSS에 넣지 않는다. 운영 중인 서비스의 공개 여부는 용도에 맞게 구분한다.

## 5. 콘텐츠/SEO MUST

front matter: title, description, pubDate, updatedDate(실제 수정 시), category, tags, draft. optional: canonical, articleType, service, featured, evidenceStatus, changeSummary. schema로 category와 서비스 참조를 검증한다.

slug 변경은 301, draft는 build/RSS/sitemap 제외, 없는 URL은 실제 404. 자체 canonical을 기본으로 한다. 기존 서비스 sitemap·robots·noindex 정책은 포털 작업에서 변경하지 않는다.

실험 수치는 환경·방법·한계·관측 시점을 표시하고 mock/DRY_RUN을 실제 운영 결과로 쓰지 않는다. 15편·1,500자는 내부 편집 목표이며 승인 규칙이 아니다. 기존 서비스에 관한 글은 확인된 사실을 기록하는 콘텐츠이며 서비스 재설계 요구사항이 아니다.

## 6. 광고 MUST

구현 범위는 itsdev.kr의 적격 공개 콘텐츠이다. 기존 서브도메인의 광고 설정은 별도 과제로 둔다. 계정 Ready·실제 publisher ID·고지/동의 설정·ads.txt를 확인한 뒤 표시한다. 승인과 수익을 보장하지 않는다.

초기 홈/목록 광고 없음, 상세 최대 2개 후보. 클릭 유도나 CTA와 혼동되는 배치 금지. 광고/CMP 포함 CLS와 독서 경험을 검수한다. 적용 지역의 최신 광고/동의 요건은 출시 시 확인한다.

## 7. 운영 SHOULD

포털 공개 probe와 Nginx 로그부터 관측한다. 기존 관측 시스템을 이용하면 수집되는 포털 데이터·권한·자원 영향을 확인한다. 관측 시스템 재배포나 agent migration을 이번 작업에 포함하지 않는다.

소스/산출물/포털 config를 복구 대상으로 하고 DB 백업 과제는 만들지 않는다. rollback과 origin 재구성은 실제 소요 시간으로 검증한다.

## 8. 버전 관리와 완료 증거 MUST

main/feat/*/fix/*/docs/*, Conventional Commits, 관심사별 issue. `.env*` 제외하되 비밀 없는 `.env.example` 허용, pem/token/credential 제외.

정상 변경은 versioned config로 반영한다. 긴급 변경은 사유·차이·결과 기록 후 동기화한다. 증거는 commit/build ID·검증 환경·결과·미결·rollback 경로이다. 예외는 memory에 범위/이유/위험/재검토 조건으로 기록한다. 미실행을 통과로 쓰지 않는다.
