/** Use explicit settings when supplied, otherwise the Vercel Upstash integration. */
export function luperRedisConfig(env: NodeJS.ProcessEnv = process.env) {
  return env.LUPER_REDIS_REST_URL || env.LUPER_REDIS_REST_TOKEN
    ? { url: env.LUPER_REDIS_REST_URL, token: env.LUPER_REDIS_REST_TOKEN }
    : { url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN };
}

/** Keep the public launcher and API in sync when deployment settings are incomplete. */
export function isLuperEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const redis = luperRedisConfig(env);
  return env.LUPER_ENABLED === 'true' && !!env.OPENAI_API_KEY
    && (env.NODE_ENV !== 'production' || !!(redis.url && redis.token));
}
