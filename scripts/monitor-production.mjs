import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_ORIGIN = 'https://itsdev.kr';
const ALERT_TITLE = '[Production monitor] itsdev.kr probe failed';
const REQUEST_TIMEOUT_MS = 10_000;

async function fetchText(url, fetchImpl) {
  const response = await fetchImpl(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return body;
}

export async function probeOnce({ origin = DEFAULT_ORIGIN, fetchImpl = fetch } = {}) {
  const failures = [];
  try {
    await fetchText(`${origin}/`, fetchImpl);
  } catch (error) {
    failures.push(error.message);
  }

  let listing = '';
  try {
    listing = await fetchText(`${origin}/articles/`, fetchImpl);
  } catch (error) {
    failures.push(error.message);
  }

  const articlePath = listing.match(/href=["'](\/articles\/[a-z0-9][a-z0-9-]*\/)["']/i)?.[1];
  if (!articlePath) {
    failures.push(`${origin}/articles/ did not contain a published article link`);
  } else {
    try {
      const article = await fetchText(`${origin}${articlePath}`, fetchImpl);
      if (!article.includes('<article class="fieldnote"')) {
        failures.push(`${origin}${articlePath} did not contain a rendered fieldnote article`);
      }
    } catch (error) {
      failures.push(error.message);
    }
  }

  return { ok: failures.length === 0, failures };
}

export function getAlertAction(rounds) {
  if (rounds.length !== 3) throw new Error('The production monitor requires exactly three probe rounds.');
  if (rounds.every((round) => round.ok)) return 'resolve';
  if (rounds.every((round) => !round.ok)) return 'alert';
  return 'hold';
}

async function githubRequest(url, { token, method = 'GET', body }) {
  const response = await fetch(url, {
    method,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`GitHub issue API returned HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}

async function findOpenAlert(apiBase, token) {
  const issues = await githubRequest(`${apiBase}/issues?state=open&per_page=100`, { token });
  return issues.find((issue) => !issue.pull_request && issue.title === ALERT_TITLE);
}

async function syncAlert(action, rounds, { apiBase, token }) {
  const issue = await findOpenAlert(apiBase, token);
  if (action === 'hold') {
    console.log('Monitor was inconclusive; existing alert state is unchanged.');
    return;
  }
  if (action === 'resolve') {
    if (issue) {
      await githubRequest(`${apiBase}/issues/${issue.number}`, {
        token,
        method: 'PATCH',
        body: { state: 'closed', state_reason: 'completed' },
      });
      console.log(`Closed recovered production alert #${issue.number}.`);
    } else {
      console.log('All three production probes passed; no open alert to close.');
    }
    return;
  }

  const evidence = rounds.map((round, index) => {
    const detail = round.failures.map((failure) => `  - ${failure}`).join('\n');
    return `### Probe ${index + 1}\n${detail}`;
  }).join('\n\n');
  if (issue) {
    await githubRequest(`${apiBase}/issues/${issue.number}`, {
      token,
      method: 'PATCH',
      body: {
        body: `The production probe remains unhealthy.\n\nIncident opened: ${issue.created_at}\nLatest consecutive failure: ${new Date().toISOString()}\n\n${evidence}\n\nFollow the [production operations runbook](https://github.com/${process.env.GITHUB_REPOSITORY}/blob/main/docs/OPERATIONS.md).`,
      },
    });
    console.log(`Updated existing production alert #${issue.number}; duplicate issue suppressed.`);
    return;
  }

  const created = await githubRequest(`${apiBase}/issues`, {
    token,
    method: 'POST',
    body: {
      title: ALERT_TITLE,
      body: `Three consecutive production probe rounds failed at ${new Date().toISOString()}.\n\n${evidence}\n\nFollow the [production operations runbook](https://github.com/${process.env.GITHUB_REPOSITORY}/blob/main/docs/OPERATIONS.md).`,
    },
  });
  console.log(`Opened production alert #${created.number}.`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  const rounds = [];
  const intervalMs = Number(process.env.MONITOR_INTERVAL_MS ?? 30_000);
  for (let index = 0; index < 3; index += 1) {
    if (index > 0 && intervalMs > 0) await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const result = await probeOnce();
    rounds.push(result);
    console.log(`Production probe ${index + 1}/3: ${result.ok ? 'PASS' : `FAIL (${result.failures.join('; ')})`}`);
  }

  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository) throw new Error('GITHUB_TOKEN and GITHUB_REPOSITORY are required to manage deduplicated alerts.');
  const action = getAlertAction(rounds);
  await syncAlert(action, rounds, { apiBase: `https://api.github.com/repos/${repository}`, token });
  if (action === 'alert') process.exitCode = 1;
}
