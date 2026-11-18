# LXP Luper

Luper is the website's AI concierge. It answers from `lib/content.ts` and
`lib/partners.ts`, asks for vehicle details, and offers a visitor-controlled
WhatsApp draft. It has no live inventory, booking or order access. Replies are
plain text; links in the interface are controlled by the application.

## Local preview

Set `OPENAI_API_KEY` securely in the ignored `.env.local`. Use the API organization
that received the subscription credits. Start with:

```sh
LUPER_ENABLED=true npm run dev -- --port 3004
```

The Luper development checkout is separate from the main preview on port 3002.
The local `.luper-data/launch-v1.json` records conservative reservations across
restarts. Do not delete it to reset the allowance. A stale `.luper-data/lock`
causes requests to fail closed; after a crash, confirm no Luper requests are
running before removing only that lock directory.

## Budget and production setup

- Fixed model: `gpt-6-luna`, Standard pricing, reasoning disabled, no paid tools.
- At most 10 KB of conversation text, 12 KB of instructions, 450 output tokens.
- Reserve $0.01 **before each API attempt**, up to a non-renewing $10 launch
  allowance. This deliberately overestimates request costs; it is not a display
  of actual OpenAI spend or the current credit balance. Failed attempts retain
  their reservation because timeouts may still be billed.
- Eight attempts per minute per trusted Vercel client IP; unknown platforms
  share one bucket. IPs are HMAC-hashed before storage. No chat text is logged
  or stored by this application. OpenAI receives the conversation with
  `store: false`; this does not override OpenAI's other data retention policies.
- Production requires a shared Upstash-compatible Redis REST database with
  atomic `EVAL`, supplied through `LUPER_REDIS_REST_URL` and
  `LUPER_REDIS_REST_TOKEN`. Use a durable database with eviction disabled. The
  non-expiring `luper:launch:v1:reserved-cents` key must not be deleted or reset.
  Do not use separate budget databases for instances sharing this allowance.
- Set `LUPER_SITE_ORIGIN` to the exact website origin (no trailing slash), then
  set `LUPER_ENABLED=true`. Missing keys, missing shared storage, exhausted
  allowance, API errors and timeouts all fall back to WhatsApp. Setting
  `LUPER_ENABLED=false` disables AI calls immediately on restart/redeployment.
- Review the API Usage dashboard for actual spend. Other apps in the linked
  organization may consume the same credits; this app cannot reserve those
  credits at OpenAI or prevent other apps from spending them. The grant expires
  on its own billing schedule. Do not enable automatic paid top-ups merely to
  keep this trial running.

The cost margin uses the published GPT-6 Luna rates as checked on 18 November
2026: $0.10 / 1M input tokens, $0.50 / 1M output tokens (cache writes $0.125 / 1M).
Even bounding input tokens by UTF-8 bytes plus message framing stays below the
one-cent reservation. Review these rates and all bounds before changing models,
tools, service tier or the allowance. No automatic renewal is implemented.

Sources: https://developers.openai.com/api/docs/models/gpt-6-luna and
https://developers.openai.com/api/docs/guides/chatgpt-api-credits

## Checks

```sh
node --test tests/luper.test.mjs
npm run typecheck
npm run build
```

Before public release, configure the shared ledger and run a real chat plus a
failure test in that deployment. Current local verification does not establish
that production credentials or shared storage are configured.

Verified on 18 November 2026: six automated tests passed, TypeScript passed,
and the production build passed. The local endpoint returned successful live
answers for a Ferrari enquiry, a follow-up asking for price/stock/booking,
an instruction-override attempt and an Arabic Porsche enquiry. The contact page
served HTTP 200 with the launcher and dialog. Browser automation timed out, so
desktop/mobile visual and keyboard checks remain outstanding. The temporary
preview server was stopped after verification; use the command above to restart.
