declare const __PACKAGE_VERSION__: string;

const NPM_REGISTRY_URL =
  'https://registry.npmjs.org/@cashfreepayments/agent-toolkit/latest';

let checked = false;

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10));
  const pb = b.split('.').map(n => parseInt(n, 10));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

async function fetchLatestPublishedVersion(): Promise<string | null> {
  try {
    const res = await fetch(NPM_REGISTRY_URL, {
      signal: AbortSignal.timeout(2500),
      headers: {accept: 'application/json'},
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {version?: string};
    return json.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget, non-blocking check for a newer published version.
 * Never installs anything — a payments SDK mutating a consumer's
 * node_modules/lockfile on its own would be a supply-chain red flag.
 * Only warns once per process even if multiple toolkits are constructed.
 */
export function checkForUpdates(): void {
  if (checked) return;
  checked = true;

  fetchLatestPublishedVersion()
    .then(latest => {
      if (!latest || compareVersions(latest, __PACKAGE_VERSION__) <= 0) return;
      console.warn(
        `\n[@cashfreepayments/agent-toolkit] A newer version is available ` +
          `(v${__PACKAGE_VERSION__} -> v${latest}).\n` +
          `Run: npm install @cashfreepayments/agent-toolkit@latest\n`
      );
    })
    .catch(() => {});
}
