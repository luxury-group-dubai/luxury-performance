import 'server-only';

let cachedToken: { value: string; renewAt: number } | undefined;
let tokenRequest: Promise<string> | undefined;

async function exchangeCredentials(domain: string, clientId: string, clientSecret: string) {
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Shopify Admin API token request failed.');

  const { access_token, expires_in } = await response.json();
  if (typeof access_token !== 'string' || !access_token
    || !Number.isFinite(expires_in) || expires_in <= 0) {
    throw new Error('Invalid Shopify Admin API token response.');
  }
  cachedToken = { value: access_token, renewAt: Date.now() + Math.max(0, expires_in - 60) * 1000 };
  return access_token;
}

async function adminToken(domain: string): Promise<string> {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId && !clientSecret && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  }
  if (!clientId || !clientSecret) throw new Error('Shopify Admin API access is not configured.');
  if (cachedToken && Date.now() < cachedToken.renewAt) return cachedToken.value;

  tokenRequest ??= exchangeCredentials(domain, clientId, clientSecret).finally(() => {
    tokenRequest = undefined;
  });
  return tokenRequest;
}

export async function shopifyAdmin<T>(
  query: string,
  variables: Record<string, unknown>,
  cacheOptions: { cache: 'no-store' } | { next: { revalidate: number } },
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'krtymq-v4.myshopify.com';
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
    throw new Error('Shopify Admin API requires a myshopify.com store domain.');
  }
  const token = await adminToken(domain);

  const response = await fetch(`https://${domain}/admin/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    ...cacheOptions,
  });
  if (!response.ok) throw new Error('Shopify Admin API request failed.');

  const result = await response.json();
  if (result.errors?.length || !result.data) throw new Error('Shopify Admin API query failed.');
  return result.data as T;
}
