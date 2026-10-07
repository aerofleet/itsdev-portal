# Task · Roadmap & Acceptance Evidence

> v5 · 2026-10-07 · 1인 실작업 추정, 대기 시간 제외
> 대상: itsdev.kr 포털만. 기존 서브도메인은 이미 운영 중이며 재구축하지 않는다. 체크박스는 문서 개정으로 완료 처리하지 않는다.

## 1. 작업 순서와 규모

Workers 계정/설정 확인 → 디자인 검수/배포 준비 → 포털 구축 → 콘텐츠·출시 검수 → 별도 수익화 게이트. 약 72~110h 후보(Phase 0: 2~4h, 1: 4~6h, 2: 24~36h, 4: 36~52h, 5: 6~12h)이다. 주당 18~22h 확보 시 약 4~7주이며 AdSense 심사 대기는 제외한다. 콘텐츠 작업은 구현과 병행한다.

## 2. Phase 0 · Workers/편집 결정 · 2~4h

| Task | 작업 | 선행 | 완료 증거 |
|---|---|---|---|
| T-001 | Cloudflare 계정·zone·Worker 이름·플랜/자산 제한 확인 | 없음 | itsdev.kr 권한·가칭 이름·한도 기록, VM 배치 없음 |
| T-002 | 포털 소개에 사용할 기존 서비스 설명·외부 링크 검수 | 없음 | 공개용 소개/링크 목록. 서비스 개발·배포 확인 과제는 없음 |
| T-003 | 레포명·content ownership·대표 원본 결정 | 없음 | 저장소/콘텐츠 경계 ADR |

- [ ] T-001 / T-002 / T-003

## 3. Phase 1 · 포털 Edge/배포 준비 · 4~6h

| Task | 작업 | 선행 | 완료 증거 |
|---|---|---|---|
| T-101 | itsdev.kr HTTPS·Workers production URL 정책 | T-001 | HTTPS, workers.dev/preview off, wildcard 추가 없음 |
| T-102 | Wrangler assets/404/URL 정규화 설정 | T-001 | schema/dry-run, 실제 404, Astro trailing slash 일치 |
| T-103 | Static Assets 용량·파일 수·요금/CI 제한 확인 | T-001 | build 자산 목록·크기·계정 한도, Worker 실행 최소화 |
| T-104 | Workers Custom Domain itsdev.kr 연결 계획/적용 | T-102/103 | 루트 DNS/route 충돌 확인·HTTPS, 서브도메인 유지 |
| T-105 | Actions API token·account ID·배포 경로 | T-001 | 최소 권한·비밀값 보호, 중복 production CI 없음 |
| T-106 | 포털 probe·Cloudflare 분석 확인 | T-001 | 공개 probe·자산 분석 가용 범위, 실행 로그 한계 기록 |

- [ ] T-101 / T-102 / T-103 / T-104 / T-105 / T-106

## 4. Phase 2 · 디자인/포털 · 24~36h

| Task | 작업 | 선행 | 완료 증거 |
|---|---|---|---|
| T-201A | Fieldnotes 홈·본문 디자인 검수 | T-002 | design-board 참고, 360/768/1440 구성, 샘플 지표 없음 |
| T-201B | 토큰/컴포넌트·light/dark | T-201A | Masthead/DecisionStrip/FieldnoteRow, 대비 검사 |
| T-202 | Astro 홈·목록·상세·서비스·소개·문의 | T-003/201B | 정적 build, JS off 링크/목차, 긴 제목/코드 검수 |
| T-203 | Privacy/Terms/광고 동의 설계 | T-002 | 포털의 실제 처리/외부 링크 고지 범위, 적용 지역 확인 |
| T-204 | schema/SEO/RSS/canonical | T-202 | draft 제외, 정적 링크·404·OG·canonical 검사 |
| T-205 | dist·_headers·_redirects·404 정적 구성 | T-102/202 | 파일 복사·헤더·slug 301·존재하지 않는 URL 404 |
| T-206 | Actions build/Wrangler deploy/version rollback | T-105/205 | SHA/artifact/version/deployment ID·동시 실행 억제·rollback |
| T-207 | Static Assets 응답·캐시·성능 | T-204/206 | 내용/ETag/cold-warm·lab 3회·구 asset URL 전환 검증 |
| T-208 | 접근성/반응형·디자인 인계 | T-202/207 | 키보드·320px·200%·reduced motion·다크모드, 반려 기준 검수 |

- [ ] T-201A / T-201B / T-202 / T-203 / T-204 / T-205 / T-206 / T-207 / T-208

T-201A는 문서만 읽고 완료하지 않는다. 실제 구현 화면에서 대표 글과 서비스의 시각적 위계가 유지되는지 확인한다.

## 5. 제외된 작업 · 이전 Phase 3

T-301~T-306은 잘못 확장된 서브도메인 재구축·라우팅·인증·화면 변경 작업이므로 **이번 로드맵에서 제외**한다. 이미 운영 중인 서비스의 구성과 공개 상태를 신규 계획으로 취급하지 않는다. 작업 번호는 재사용하지 않는다. 포털 소개 페이지와 외부 링크는 T-002/202/402에서 처리한다.

## 6. Phase 4 · 콘텐츠 · 36~52h

| Task | 작업 | 완료 증거 |
|---|---|---|
| T-401 | 15편 내부 목표, 완성본 5편부터 출시 가능 | 저자 검수, 근거·환경·한계, draft 분리 |
| T-402 | 기존 서비스의 포털 내 사례 소개 | 정확한 제품 설명·Public 외부 링크·관련 개발기 |
| T-403 | Tistory 원본·재구성·canonical | 글별 대표 원본 목록 |
| T-404 | 편집/정정 기준 | 예시 2편의 Decision/Evidence/ChangeLog 검수 |

- [ ] T-401 / T-402 / T-403 / T-404

초기 후보: Infra 5(노출 차단, Tunnel, OCI 운영, Blue-Green, 복구), Backend 4(풀 고갈, 2단 캐시, migration, 모듈 경계), AI 3(RAG 경계, SSE, 개인 agent 운용), Project Log 3(실제 수집 소스 선택, 중복/만료, 포털 구축). 실제 경험·측정 자료가 없는 주제는 제목을 바꾸거나 보류한다. 새로 배포하지 않은 기능을 운영 회고로 쓰지 않는다.

## 7. Phase 5 · 수익화/운영 · 6~12h

| Task | 작업 | 선행 | 완료 증거 |
|---|---|---|---|
| T-501 | 소유 확인/ads.txt/사이트 심사 | M3 | 실제 publisher ID, crawler 접근, 계정 상태 기록 |
| T-502 | 승인 후 제한 광고·동의 설정 | T-501 Ready | 광고 off/no-fill/filled, CLS·독서 검수 |
| T-503 | 알림/억제/runbook | T-106 | 낮은 트래픽 오탐 방어, 연속 probe 실패 시나리오 |
| T-504 | Workers 이전 version 복구·소스 재배포 | T-206 | HTML/asset 복구·소요 시간, DNS/secret 변경 별도 기록 |
| T-505 | 30일 baseline·개선 우선순위 | M3 | 실제 유입·관련 글/서비스 이동, 과장 없는 보고 |

- [ ] T-501 / T-502 / T-503 / T-504 / T-505

## 8. Milestones

| M | 게이트 | 실패 시 |
|---|---|---|
| M0 | Workers 계정/설정·콘텐츠 원본·레포 결정 | 권한/설정 불확실 시 배포 보류 |
| M1 | Workers CI 배포 경로·Custom Domain 계획·probe 확인 | 설정/권한 수정 |
| M2 | 디자인·정적 build·대표 글 5편·rollback | prototype/비공개 검수 유지 |
| M3 | 포털 콘텐츠·SEO·배포 권한·접근성·성능 게이트 | 포털의 문제 영역 수정 |
| M4 | 심사 신청 | 준비 부족이면 콘텐츠 개선 |
| M5 | Ready+광고/동의/CLS 검수 | 광고 off 유지 |

## 9. 작업 기록 서식

`Task ID / commit 또는 config revision / 환경 / 수행 시각 / 기대 결과 / 실제 결과 / 증거 위치 / 미결 / rollback`.

이 문서의 개정 완료와 서버/서비스 구현 완료는 구분한다. 모든 미실행 항목은 체크하지 않는다.
