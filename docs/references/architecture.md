# Architecture · itsdev.kr on Cloudflare Workers

> v5 · 2026-10-07 · 사용자 확정: Cloudflare Workers 배포
> 대상은 itsdev.kr 단일 포털이며 문서 개정이다. 실제 배포·DNS 변경은 수행하지 않았다.

## 1. 범위와 설계

itsdev.kr는 Astro로 미리 생성한 콘텐츠를 **Cloudflare Workers Static Assets**에서 제공한다. 기존 서브도메인은 이미 운영 중인 외부 서비스로 취급하며 소개 글·외부 링크만 제공한다. 해당 서비스의 구성·배포·인증·DB는 이 문서에 포함하지 않는다.

포털에 VM·Nginx·cloudflared·SSH·rsync·symlink 배포를 사용하지 않는다. Astro는 `output: 'static'`을 사용하고 빌드 결과 `dist/`를 업로드한다. 초기에는 SSR adapter, Worker fetch handler, D1/KV/R2 등 런타임 저장소를 추가하지 않는다. Cloudflare Pages 및 구형 Workers Sites 배포가 아닌 Workers Static Assets를 사용한다.

## 2. 구성과 요청 흐름

| 구성 | 역할 |
|---|---|
| Git 저장소 | Markdown·이미지·Astro 소스·Wrangler 설정 |
| GitHub Actions | schema/link 검증·정적 build·Wrangler 배포 |
| Workers Static Assets | HTML/CSS/JS/이미지의 호스팅·관리형 자산 캐시 |
| Custom Domain | itsdev.kr를 포털 Worker에 연결·HTTPS 제공 |
| public/_headers | 정적 응답 보안 헤더·브라우저 캐시 정책 |
| public/_redirects | 변경된 포털 slug의 명시적 redirect |
| Workers versions/deployments | 배포 버전과 이전 버전 복구 |

독자 → `https://itsdev.kr` → Cloudflare Custom Domain → Static Assets → HTML/CSS/이미지 응답. 정적 자산은 Worker 사용자 코드 호출 없이 제공하도록 구성한다. 자산에 없는 URL은 포털의 404 페이지와 실제 404 상태를 반환한다.

Worker가 origin 역할을 하므로 OCI origin이나 Tunnel 연결이 없다. 도메인 연결은 itsdev.kr 하나로 한정한다. wildcard route, 기존 서비스 proxy, 루트 전체 외부 redirect를 만들지 않는다.

## 3. 콘텐츠·경로

홈 `/`, 아티클 `/articles/`와 `/articles/{slug}/`, 카테고리 `/articles/category/{category}/`, 서비스 소개 `/services/`와 `/services/{slug}/`, 신뢰 페이지 `/about/`·`/contact/`·`/privacy/`·`/terms/`를 생성한다.

RSS/sitemap/robots/ads.txt와 `404.html`을 build 결과에 포함한다. Draft는 dist/RSS/sitemap에서 제외한다. 정적 목록·페이지네이션·목차를 제공하고, 회원·댓글·서버 검색·문의 폼 backend는 MVP에 포함하지 않는다.

Astro의 `site`는 `https://itsdev.kr`, `trailingSlash`는 `always`로 설정한다. Workers의 HTML handling도 이를 맞춘다. RSS·sitemap·ads.txt는 파일 URL 그대로 제공되는지 확인한다. SPA fallback을 사용해 없는 페이지를 200으로 반환하지 않는다.

## 4. Wrangler 설정 초안

레포와 Worker 이름은 가칭이다. 아래는 정적 배포 설정 예시이며 실제 프로젝트/계정에서 Wrangler schema·dry-run·배포 검증 후 확정한다. compatibility_date는 자동으로 매일 변경하지 않는다.

```json
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "itsdev-portal",
  "compatibility_date": "2026-10-07",
  "workers_dev": false,
  "preview_urls": false,
  "assets": {
    "directory": "./dist",
    "html_handling": "force-trailing-slash",
    "not_found_handling": "404-page"
  },
  "routes": [
    { "pattern": "itsdev.kr", "custom_domain": true }
  ]
}
```

정적 자산 전용 구성에는 `main`과 ASSETS binding이 필요하지 않다. 초기에는 `run_worker_first`를 활성화하지 않는다.

`workers_dev`/preview URL은 production에서 기본 비활성화한다. 검수용 preview를 켤 경우 별도 환경에서 접근 제어와 noindex를 적용한다. noindex만으로 비공개가 되지는 않는다. preview의 canonical·sitemap은 production 기준이며 draft/비밀값을 올리지 않는다.

## 5. Custom Domain과 DNS

Cloudflare 계정·Workers 권한·itsdev.kr zone 소유권을 확인하고 Custom Domain을 연결한다. 기존 루트 A/AAAA/CNAME·redirect·Worker route를 사전에 확인하여 충돌을 해소한다. 필요한 변경은 루트에 한정하고 기존 서브도메인 DNS/route는 유지한다.

Custom Domain 연결 전 정적 산출물과 배포 권한을 검증한다. 연결 후 HTTPS·루트 200·대표 글·404·정적 asset MIME을 확인한다. HSTS includeSubDomains/preload는 추가하지 않는다. www hostname 추가는 별도 요청이 있을 때 결정한다.

## 6. CI/CD·롤백

기본 CI는 GitHub Actions이며 Workers Builds를 동시에 production 자동 배포로 켜지 않는다. 하나의 배포 경로로 중복 배포를 방지한다.

1. PR: `npm ci` → 콘텐츠 schema·내부 링크 검증 → `npm run build` → dist 검사.
2. main: 동일 검증과 build 후 `npx wrangler deploy --dry-run`으로 설정/업로드 구성을 검사한다.
3. `npx wrangler deploy`로 commit SHA의 정적 자산을 배포한다. 배포 concurrency group은 포털 하나로 지정한다.
4. commit SHA·build artifact·Worker version ID·deployment ID를 함께 기록한다.
5. 공개 itsdev.kr 홈·대표 글·CSS·RSS·sitemap·ads.txt·404를 smoke check한다.
6. 실패 시 기록된 이전 정상 version ID로 `npx wrangler rollback <VERSION_ID>` 또는 Dashboard rollback을 수행하고 공개 URL을 다시 확인한다.

Wrangler/Node/Astro 버전은 lockfile과 CI 설정으로 고정한다. API token과 account ID는 CI에서 관리하고 bundle에 넣지 않는다. Worker 배포 권한은 Cloudflare가 허용하는 resource scope를 최소화한다. Custom Domain 관리에 필요한 zone 권한과 일상 배포 권한은 구분하며, token을 Worker 하나로 제한할 수 있다고 임의로 가정하지 않는다.

정적 자산도 version의 일부이다. 파일 복사·current symlink 전환·origin 캐시 purge 절차를 사용하지 않는다. 기본은 단일 버전 100% 배포이며 gradual rollout은 초기 제외한다. 긴 브라우저 캐시를 설정한 hash asset의 구버전 URL이 배포 전환 후 어떻게 제공되는지 실제 확인하고 복구/재현 방법을 기록한다.

## 7. 캐시·헤더·redirect

Static Assets의 관리형 캐시와 ETag를 활용한다. 기존 origin의 HTML Cache Rule·s-maxage·Always Online 전략을 그대로 적용하지 않는다. deployment 변경 후 실제 내용·ETag·cache 상태를 확인한다. zone 전체 purge를 배포 필수 단계로 만들지 않는다.

| 자산 | 브라우저 정책 |
|---|---|
| HTML/RSS/sitemap/ads.txt | 기본 재검증 정책 `public, max-age=0, must-revalidate` 유지 |
| Astro hash assets | 검증된 hash 전용 경로에만 장기 캐시·immutable |
| 404 | 실제 404, 잘못된 URL의 200 fallback 금지 |

`public/_headers`는 dist로 복사되어야 한다. 초기 예시:

```text
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

`_astro` 경로에 배포마다 이름이 바뀌지 않는 파일이 포함되는지 검사하고, 해당 파일이 있으면 장기 캐시 규칙을 좁힌다. CSP는 inline 테마 script·광고/CMP에 필요한 소스를 확인해 별도로 작성한다. 직접 작성한 Worker 응답에는 `_headers`가 자동 적용되지 않으므로 향후 handler 추가 시 응답 헤더를 코드에서 적용해야 한다.

포털 slug 변경은 `public/_redirects`에서 명시적 301로 관리한다. 도메인 전체 redirect나 SPA catch-all은 만들지 않는다. 자동 HTML URL 정규화의 redirect 상태와 SEO slug 변경 301은 구분한다.

## 8. 비용과 성능

공식 문서 기준 Static Assets 요청은 무료·무제한이며 자산 저장 추가 비용은 없다. Worker 사용자 코드 실행 요청은 별도 Workers 요금/한도를 따른다. 파일 수·개별 크기·CI build 등 제한과 부가 서비스 비용은 배포 시 확인한다. 프로젝트 전체 비용 0원 또는 무제한 플랫폼으로 일반화하지 않는다.

정적 페이지를 Worker handler/SSR로 불필요하게 경유하지 않는다. 비용 기준은 정적 자산 중심, 최소 UI script, 추가 저장소 없음이다.

목표: 모바일 LCP ≤2.0s(출시 ≤2.5s), CLS ≤0.1, 자체 UI gzip JS ≤8KB, warm 응답 TTFB 목표 ≤200ms. 대표 3페이지 동일 조건 3회 중앙값과 cold/warm 차이를 기록한다. field INP는 트래픽 확보 후 측정한다. 광고/CMP 포함 상태를 별도로 검수한다.

## 9. 관측·복구

공개 HTTPS probe·본문/상태·404 증가·CI 배포 실패·Cloudflare 자산/요청 분석을 확인한다. 사용자 코드가 없는 정적 요청이 Worker execution log에 전부 기록된다고 가정하지 않는다. 로그 가용성·보관·플랜은 실제 계정에서 확인한다. 서버 RAM/swap/Nginx 로그·수집 agent 설치는 포털 과제가 아니다.

복구 원본: Git source·lockfile·Wrangler 설정·CI artifact·이전 Worker version. rollback RTO 10분, 재배포 RTO 30분은 리허설 전 내부 목표이다. DB restore·VM 재구성은 없다. DNS/custom domain 변경과 secret은 코드 rollback에 자동 포함된다고 가정하지 않으며 별도 변경 이력을 유지한다.

## 10. 구현 전 확인과 근거

T-001 계정/zone/Worker 이름, T-104 Custom Domain, T-105 CI 권한, T-205 assets/headers/redirect 설정, T-206 배포/rollback, T-207 성능/404, T-504 복구 증거를 확인한다. 이 문서는 명세이며 해당 작업을 완료 처리하지 않는다.

- Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Configuration: https://developers.cloudflare.com/workers/static-assets/binding/
- SSG/404: https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
- Headers: https://developers.cloudflare.com/workers/static-assets/headers/
- Custom Domain: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Rollback: https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/
- Billing: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
