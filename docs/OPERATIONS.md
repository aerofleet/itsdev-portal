# Production operations

## Availability monitor · T-503

The `Production monitor` GitHub Actions workflow runs every 15 minutes and can be started manually. Each run probes `/`, `/articles/`, and one published article route discovered from the listing. It performs three rounds 30 seconds apart, with a 10-second timeout per request. HTTP success alone is insufficient: the article route must contain the rendered fieldnote article.

An alert is opened only after all three rounds fail. The open issue is the single active incident record; later failed runs update that issue instead of creating duplicates. The issue closes only after all three rounds pass. A mixed result leaves the current alert state unchanged. This dampens isolated edge/network failures while still testing content delivery. The Actions workflow needs the repository's built-in `GITHUB_TOKEN` with `issues: write`; it creates no external service token. Configure GitHub notifications for repository issues to receive the alert.

- **OKR:** Keep readers able to reach current fieldnotes and the portal entry point.
- **Target KPI:** detect sustained portal/content-route failures within one monitor run (maximum 150 seconds when all three route requests hit their 10-second timeout); no more than one open monitor incident at a time.
- **Evaluation set:** 3 independent rounds × home, article listing, and 1 article selected from the live listing; 10-second per-request timeout; workflow schedule every 15 minutes.
- **Before:** no recurring public probe, deduplication, or recovery signal was configured.
- **After:** automated probe and alert lifecycle are implemented; production evidence will begin only after this workflow is merged to `main` and its first scheduled/manual run completes.
- **Pass criteria:** 3/3 healthy rounds produce no open incident; 3/3 failed rounds create or update exactly one incident; mixed rounds do not create or close an incident; 3/3 healthy rounds close an existing incident.

### Incident response

1. Open the alert's linked Actions run and inspect all three rounds. Confirm whether failure affects the home, listing, or selected article detail.
2. Check the public route directly, then inspect the latest `main` commit and deployment result in Actions. Do not roll back for one transient probe or a single failing route.
3. If repeated content failures follow a release, identify a known-good Worker version from the Cloudflare deployment history. Check the version's source commit and confirm its content/data assumptions before rollback. In particular, avoid restoring a version that emits an ungated AdSense loader.
4. With the Cloudflare production credential available, use the pinned Wrangler CLI and explicit version ID: `npx wrangler rollback <VERSION_ID> --name itsdev-portal --message "Restore last known-good portal release" --yes`. Verify the command's target and version before running it. This runbook records the command; rollback has not been rehearsed against production.
5. Re-run the monitor manually and confirm all three rounds pass. Record incident time, release/version IDs, rollback duration, route results, and follow-up in the issue.

Rollback rehearsal remains an operator task because it changes the production Worker version. Before claiming T-504 complete, rehearse in a non-production Worker or with explicit production approval, and verify HTML plus asset recovery. Do not modify DNS, secrets, or the AdSense activation variables during rollback.
