# Directus 콘텐츠 발행 연결

Directus는 OCI에서 운영하고 HeatWave의 전용 `itsdevcms` 데이터베이스에 연결한다. 포털은 Astro 정적 사이트로 빌드하며, 공개 글만 빌드 시 Directus API에서 읽어 HTML/RSS/sitemap에 포함한다. 브라우저에서 CMS API를 호출하지 않고 DB 자격증명도 포털이나 GitHub에 두지 않는다.

## Directus 컬렉션

기본 컬렉션 이름은 `fieldnotes`이며 GitHub Repository Variables의 `DIRECTUS_ARTICLES_COLLECTION`으로 바꿀 수 있다. 기본 시스템 상태 필드 `status`는 `published`, `draft`, `archived`를 사용한다. 아래 필드는 포털의 Astro 콘텐츠 schema와 이름·형식을 맞춘다.

| 필드 | 형식 | 필수 |
|---|---|---|
| `slug` | 문자열, 고유 | 예 |
| `title`, `description`, `documentId` | 문자열 | 예 |
| `pubDate` | 날짜/시간 | 예 |
| `category` | 선택: `infra`, `backend`, `ai`, `log` | 예 |
| `tags` | 문자열 배열(JSON) | 예 |
| `body` | Markdown 원문 텍스트 | 예 |
| `updatedDate` | 날짜/시간 | 아니오 |
| `articleType` | `design`, `decision`, `incident`, `implementation` | 아니오 |
| `service` | `djc`, `withbuddy`, `myai` | 아니오 |
| `featured` | boolean | 아니오 |
| `canonical` | HTTPS URL | 아니오 |
| `environment` | 문자열 배열(JSON) | 아니오 |
| `evidenceStatus` | `planned`, `partial`, `verified` | 예 |
| `verifiedAt` | 날짜/시간 | 아니오 |
| `evidence` | 문자열 배열(JSON) | 아니오 |
| `revisions` | `{rev,date,summary}` 객체 배열(JSON) | 아니오 |

정적 빌드는 기본적으로 Directus의 익명 Public 권한으로 콘텐츠를 읽는다. Public 정책은 `fieldnotes`의 Read만 허용하고, 항목 규칙을 `status=published`로 제한한다. 포털에서 사용하는 필드만 읽기 허용하며 create/update/delete와 다른 컬렉션은 공개하지 않는다. 동기화는 `status=published` 및 `pubDate <= 현재 시각`을 적용한다. 사용자 토큰 방식이 필요하면 `DIRECTUS_PUBLIC_READ=false`로 전환하고 `DIRECTUS_READ_TOKEN`을 설정한다.

## GitHub Actions 설정

Repository Secrets에 다음 값을 등록한다.

- `DIRECTUS_API_URL`: CMS HTTPS origin, 예: `https://cms.itsdev.kr`
- `DIRECTUS_READ_TOKEN`: Public 익명 읽기를 끄는 경우에만 필요한 제한 role의 Directus static token
- `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`: Access service token을 쓰는 경우 두 값 모두 등록

Repository Variable `DIRECTUS_CONTENTS_ENABLED=true`를 설정하면 공개 build가 동기화된 Directus 콘텐츠를 사용한다. 익명 Public 읽기가 기본값이며 사용자 토큰 모드는 선택 변수 `DIRECTUS_PUBLIC_READ=false`로 설정한다. collection 이름은 선택 변수 `DIRECTUS_ARTICLES_COLLECTION`으로 지정한다. Cloudflare Access가 활성화된 경우 `CF_ACCESS_CLIENT_ID` 및 `CF_ACCESS_CLIENT_SECRET` 서비스 인증 비밀값을 설정한다. 비밀값이 없으면 CI는 기존 저장소 Markdown으로 빌드한다.

동기화 스크립트는 `.codex/directus-content/articles/` 아래에 공개 발행 글을 임시 Markdown으로 생성한다. 이 데이터는 Git에 추가하지 않는다. slug/documentId 중복, 누락 필드, 날짜 및 slug 형식을 거부하며 API 오류 응답 본문과 비밀값을 로그에 출력하지 않는다.

## 검증과 출시 기준

- OKR 연결: 검수된 글을 Directus에서 관리하고 정적 포털로 공개 발행한다.
- 목표 KPI: 공개되지 않은 글 노출 0건, 중복 slug/documentId 0건, 동기화 API 오류 0건, 브라우저에서 DB/CMS 자격증명 노출 0건.
- 평가셋: published/draft/archived/future 각 1건, 유효·중복 slug 및 documentId, 필수값 누락, 0/1/101개 공개 글. 결과는 로컬 `npm run cms:sync`와 CI artifact에서 확인한다.
- Before: 공개 글은 저장소 Markdown 기반, 원격 CMS 발행 연결 없음.
- 합격 기준: 공개 상태의 유효 글만 정적 산출물·RSS·sitemap에 포함되고 비공개/미래 글은 0건 노출. 정적 사이트는 Directus 중단 중에도 마지막 배포 페이지를 제공한다.

Cloudflare Tunnel/Access, Directus collection·role, GitHub Secrets/Variables가 구성되기 전에는 CMS 발행을 활성화하지 않는다. CMS 데이터베이스 자체는 OCI에서 운영하며 Cloudflare Workers로 옮기지 않는다.
