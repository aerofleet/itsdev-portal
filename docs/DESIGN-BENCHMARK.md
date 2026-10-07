# PULSEFORM → ITSDEV 디자인 적용

2026-10-07 사용자 제공 `Fitness Blog & Knowledge Hub _ PULSEFORM.html`과 동반 로컬 CSS/이미지를 분석하고 Chromium 캡처로 구성 확인. 참고 원본은 Downloads에 그대로 둔다.

## 적용한 원리

| 레퍼런스 | ITSDEV 적용 |
|---|---|
| 차콜 배경 / 라임 포인트 | dark 기본, light/system 선택 유지. JS off에서는 OS 테마 적용 |
| 중앙 도입부 + 두 줄 헤드라인 | 브랜드 문장과 기록의 범위를 먼저 전달 |
| 가로로 넓은 대표 콘텐츠 | 실제 featured 글이 있으면 노출, 없으면 기록 원칙으로 연결 |
| 분류 칩 + 3열 콘텐츠 카드 | JS 없는 정적 분류 URL과 기존 기술 도판, 모바일 1열 |
| 하단 2개 안내 카드 | 기존 서비스 소개와 실제 RSS 피드 |
| FAQ 아코디언 | 기록 원칙 4개를 native details로 제공 |
| 다열 푸터 | 기록 탐색과 안내 링크를 구분 |

피트니스 사진·상표·템플릿 문구·CSS 소스를 제품에 복제하지 않는다. 기존 ITSDEV SVG와 폰트를 재사용한다. 샘플 글을 실제 발행 글로 바꾸거나 가짜 작성자/날짜/성과를 넣지 않는다. 검색·회원·장바구니·뉴스레터 수집 기능은 추가하지 않는다.

최신 요청에 따라 v8의 2×2 히어로와 Cobalt 색상은 이번 홈 구성과 차콜/라임으로 대체한다. 둥근 형태·과도한 구분선 배제·콘텐츠 진실성·정적 읽기·모션 감소 규칙은 유지한다. 원본 v8 시안과 문서는 보존한다.

## 검증 기준

- OKR 연결: 주제 → 기록/서비스 탐색의 시각적 위계. 방문 전환율 효과는 미측정이며 향상으로 주장하지 않는다.
- KPI/합격 기준: 320/390/768/1440px 가로 넘침 0건, light/dark에서 텍스트·링크 확인, JS off 분류 이동과 details 조작, broken internal link 0건. CSS gzip ≤18KB / 자체 JS gzip ≤8KB.
- 평가셋: 14개 정적 페이지, 홈 4개 viewport 및 light/dark 캡처, 기존 테마·모션·404·샘플 제외 검사. 자동 검사와 시각 확인을 구분한다.
- Before: v8 기반 지면, CSS gzip 4,788B / 자체 JS 602B, 209개 내부 링크.
- After: 최종 빌드 수치는 `.codex/verification.json`, 화면 캡처는 `.codex/*-home.png`와 `*-light.png`에 기록한다. 검증 명령은 `npm run check`, `npm run build`, `npm run verify`, `npm run test:e2e`.
- Safari/Firefox·실기기·스크린리더·운영 LCP/INP는 이번 변경에서 검증하지 않았다. 실제 발행 글은 아직 없어 카드/대표 글의 실제 콘텐츠 검수는 별도다.

검증 결과: 타입 검사 32파일 오류/경고/hint 0건, 정적 빌드 14페이지 성공, 내부 링크 244개 오류 0건, Chromium 4개 viewport × 3개 시나리오 12/12 통과. desktop·mobile·tablet 및 밝은 테마 캡처를 직접 확인했다. Workers dry-run은 설정 검사이며 공개 배포가 아니다.
