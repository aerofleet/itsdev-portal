import { setTimeout as delay } from 'node:timers/promises';

export async function verifyRoute(url, validate, {
  fetchImpl = fetch, sleep = delay, attempts = 6, retryDelay = 10_000,
  log = console.warn,
} = {}) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let failure;
    try {
      const response = await fetchImpl(url, { redirect: 'follow', signal: AbortSignal.timeout(20_000) });
      if (!response.ok) failure = new Error(`Production route returned HTTP ${response.status}: ${url}`);
      else if (!validate(await response.text())) failure = new Error(`Production content validation failed: ${url}`);
      if (failure && response.status >= 400 && response.status < 500 && ![404, 408, 429].includes(response.status)) throw Object.assign(failure, { permanent: true });
    } catch (error) {
      if (error.permanent) throw error;
      failure = error;
    }
    if (!failure) return;
    if (attempt === attempts) throw failure;
    log(`Smoke attempt ${attempt}/${attempts} failed: ${failure.message}; retrying in ${retryDelay}ms.`);
    await sleep(retryDelay);
  }
}
