# 기록 작성과 발행

실제 원본은 `src/content/articles/{slug}.md`에 둡니다. 파일명은 영문 소문자·숫자·하이픈으로 작성합니다. 숫자로만 된 이름과 `category`는 목록 경로와 충돌하므로 빌드에서 거부합니다.

## 작성 순서

1. `editorial-template.md`를 새 이름으로 복사하고 고유한 documentId를 부여합니다. 기존 문서번호는 제목·slug 변경 시에도 유지합니다.
2. 실제 환경·선택·근거·한계를 적고 `draft: true`로 검수합니다. 실측 주장은 목표 KPI / OKR 연결 / 평가셋 / Before·After / 합격 기준을 함께 적습니다.
3. `evidenceStatus: verified`에는 실제 `verifiedAt`과 `evidence` 참조가 필요합니다. 예정·일부 검증을 완료로 바꾸지 않습니다.
4. 저자 검수 후 실제 글에만 `draft: false`, `sample: false`를 적용합니다. 미래 pubDate는 빌드 기준으로 공개하지 않습니다. 예약 시각 이후 별도 재빌드가 있어야 반영됩니다.
5. 발행 전 `npm run check`, `npm run build`, `npm run verify`를 실행합니다. 배포·도메인·연락처 게이트는 별도입니다.

선택 필드: `articleType`(design/decision/incident/implementation), `service`(djc/withbuddy/myai), `featured`, `environment`, `updatedDate`, `canonical`, `revisions`.

## 공유 카드 점검

공유 이미지는 `public/images/fieldnotes-og.png`의 공통 브랜드 카드입니다. 개별 글 제목은 HTML의 OG/Twitter 메타데이터로 전달하며 이미지에 자동 합성하지 않습니다. 글의 제목·설명·발행/수정일은 frontmatter를 기준으로 렌더링합니다. 디자인을 바꾸면 `scripts/social-card.mjs` 수정 후 `npm run assets:social`로 재생성하고 PNG를 함께 저장합니다. 생성에는 Playwright Chromium이 필요하지만 일반 빌드·운영에는 필요하지 않습니다. 기존 Pretendard 서브셋을 사용하며 카드 문구는 영문으로 제한했습니다.

발행 점검은 `npm run build` → `npm run verify` 순서입니다. 모든 공개 HTML의 이미지 URL·크기·대체 텍스트·Twitter 카드와 실제 PNG의 1200×630 해상도, 300 KB 이하 여부를 검사합니다. 외부 공유 서비스의 수집 및 캐시 갱신은 배포 후 별도 확인해야 합니다. 속성 기준: [Open Graph protocol](https://ogp.me/).

## 본문과 개정 규칙

본문은 H2(`##`)부터 시작합니다. H1은 제목에서 자동 생성됩니다. H2/H3는 목차에 연결됩니다. 긴 코드와 표는 자체 스크롤 영역으로 렌더링되며 키보드로 포커스할 수 있습니다. 이미지에는 설명과 크기/비율을 정해 두고 실제 자산을 검수해야 합니다.

`revisions`는 작성자가 명시하는 `{rev, date, summary}` 배열입니다. 날짜 내림차순으로 표시하며 첫 행을 최신 개정으로 표시합니다. 개정 없는 글은 빈 배열을 유지하며 개정 표를 만들지 않습니다. 같은 rev를 반복하면 schema 검증이 실패합니다. `updatedDate`는 pubDate보다 빠를 수 없습니다.

`canonical`은 기본으로 ITSDEV 해당 글 주소입니다. 외부 대표 원본을 지정할 때는 확인한 HTTPS URL만 사용합니다. 외부 canonical을 가진 글은 로컬 sitemap에서 제외합니다. slug 변경은 `public/_redirects`에 이전 주소에서 새 주소로 가는 명시적 301을 추가합니다.

## 검증용 글

`npm run test:content`는 `.codex/content-fixtures/`에 검증용 콘텐츠를 만들고 `.codex/content-dist/`로만 빌드합니다. 모든 HTML에 noindex와 테스트 표시를 넣습니다. 이 경로는 공개용 원본/출력과 다르며 Git/CI 공개 artifact에서 제외합니다. 실제 작성 중인 Markdown을 테스트가 수정하지 않습니다.

평가셋: 공개 역할 14편(인프라 13, 백엔드 1), draft/sample/future 3편, 개정 0회/2회, 긴 제목/URL/코드/6열 표. 예상 결과는 전체 12+2, 인프라 12+1, RSS 14항목, 초안·샘플·미래 글 상세/목록/RSS 제외, 문서번호 중복 빌드 실패입니다.

목표 KPI: 내부 링크 오류 0건, 320px 페이지 가로 넘침 0건, 키보드 표 스크롤 가능, 확대 텍스트 reflow 유지. 이는 읽기·탐색 가능성을 확인하는 평가이며 방문 전환율이나 운영 성능 향상을 증명하지 않습니다. 텍스트 확대 자동 검사는 브라우저 전체 200% 확대·스크린리더·실기기 검사를 대신하지 않습니다.
