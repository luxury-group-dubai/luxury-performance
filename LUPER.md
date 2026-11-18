# LXP Luper

Luper is the website's AI concierge. It answers from `lib/content.ts`,
`lib/partners.ts` and the existing Shopify catalog, remembers visitor-provided
vehicle details during the chat, and offers a visitor-controlled WhatsApp draft.
It has no live inventory, booking or order access. Replies are plain text;
product, shop and brand cards use application-controlled catalog links.

## Shopping guidance

- A static greeting and shop/brand browsing links require no AI requests.
- Bare verified vehicle/range lookups such as `F8` return their actual shop page
  directly, without an AI call or budget reservation. Failed catalogue lookups
  return a factual temporary-unavailability message, never a claim of no parts.
- Deterministic retrieval uses the existing cached Storefront readers. It sends
  at most 12 candidates to the model, never the whole catalog. Broad enquiries
  favor the most specific brand/vehicle shop destination (for example, NOVITEC
  Ferrari 812), backed by actual product tags and canonical shop routes. A range
  request offers browsing before products; a category/part request can surface
  individual products within that brand and vehicle scope.
  Generation and trim exclusions reduce mismatches, but retrieval is not proof
  of fitment. Our team must confirm compatibility, stock and installation.
- A compact make/model index from actual parts accompanies the candidates.
  Luper must disclose unlisted vehicles before offering WhatsApp sourcing help;
  partner descriptions and scale-model collectibles do not establish coverage.
  The server also removes recommendations for an unlisted returned vehicle profile.
  Catalogue lookup failures are described as unavailable, not as missing vehicles.
- The current product, shop or partner pathname is resolved against real
  catalog entries. Arbitrary browser titles, external URLs and unrelated query
  parameters are not forwarded. A viewed product never establishes car ownership.
- One Responses request returns a strict JSON schema: reply text, up to three
  candidate IDs, make/model/year/interest/budget, and a short first-person enquiry
  summary for WhatsApp. The summary is generated in the same request, not a second
  AI call, and is included only after successful completion. The relay decodes only the
  reply string during streaming. It releases cards only after successful JSON
  validation, resolving IDs against the server's candidate set. Unknown IDs are
  discarded. Prices and image URLs come from the catalog, never model output.
- Profile values must quote visitor messages or the previous profile. They stay
  in browser memory and accompany later turns after older messages are trimmed.
  New chat clears both profile and selected options; nothing is stored locally.
- Visitors explicitly add up to three cards to their enquiry. The WhatsApp draft
  summarizes their vehicle, request, preferences and budget if supplied, with
  selected product links appended. It does not copy the conversation. It is a
  click-to-chat draft, not an automatically sent message.
  Replies recommending a team handoff set `contactTeam` in the same AI response.
  Once complete, those replies show a WhatsApp button and prefilled-enquiry hint.
  Each reply button uses that message's summary/profile and selected options from
  its recommendations, so an earlier reply retains its original vehicle context.
  Use `NEXT_PUBLIC_SITE_URL` for production links; development falls back to the
  current preview origin. Selecting cards and constructing drafts use no AI calls.
- If catalog retrieval fails or exceeds 4.5 seconds, verified partner destinations
  are not treated as vehicle coverage. A static retry/WhatsApp response is shown
  without an AI request. No automatic AI retry or additional paid tool call is made.

## Contact interface

One circular LXP launcher opens a choice between Ask Luper and WhatsApp our
team. Luper uses `@assistant-ui/react` primitives with the site's typeface,
dark glass panel matching the navigation menu, light text and red send button. The local
runtime sends bounded text through the existing `/api/luper` endpoint; it does
not use Assistant Cloud or change API credentials. Closing the panel or returning
to the contact choices preserves the conversation until page reload or New chat.

Replies stream from the Responses API through a text-only SSE relay and appear
at a steady reading pace (about 60 characters per second). The browser drains
the network independently of that pacing, so a received reply can finish appearing
without hitting the request timeout. Stop cancels both receipt and reveal.
Luper uses the loading glow until the first text arrives, then a larger steady
orb, a faster ring pulse and three dots while the reply appears. Interrupted
streams retain the visible text and show a retryable error.

WhatsApp opens directly before a chat starts. After a conversation, it prepares
a personalized draft for review and sending in WhatsApp.
The mobile panel uses modal focus handling and locks background scrolling.

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
- At most 10 KB of conversation text, 12 KB of base instructions, and 20 KB total
  instructions plus catalog/profile context and schema. Output is capped at 700
  tokens to accommodate structured fields as well as the short visible reply.
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

Shopping verification on 18 November 2026 covers strict streamed JSON decoding,
catalog matching and failure fallback, profile grounding, URL validation, selected
WhatsApp drafts, car memory, cancellation and the unchanged spending guard.
Two guarded live requests verified actual catalog suggestions and profile fields;
the first exposed a trim mismatch that was corrected before the second check.
Isolated desktop and mobile browser checks cover cards, explicit selection,
draft contents, no extra requests, page context, memory and New chat reset.
The unmerged preview runs on port 3004; deployment still needs the shared ledger.

Retired `/collections/*` pages redirect into the current shop. Luper does not fetch
or recommend Shopify collection destinations; old collection cards are rejected
when reading message metadata or preparing WhatsApp drafts.


Vehicle retrieval uses the shop's prepared catalogue and vehicle choices, including
model families, versions, repaired supplier tags and canonical supplier routes.
Manufacturer logos identify all-brand vehicle cards; supplier logos identify
brand-specific ranges. A newly named vehicle does not inherit an earlier supplier.
Bare verified range requests return locally without an AI request. The dedicated
NOVITEC 12Cilindri N-LARGO card opens `/novitec-12cilindri-n-largo#private-enquiry`;
`1cilindri` is accepted as a spelling correction. That route also bypasses AI.

The 18 November 2026 catalogue snapshot (1,425 products) passed 487 named vehicle,
version and supplier-route checks across 25 makes and 199 model families after
integrating main’s Capristo/Valvetronic grouping updates. Visitor-facing aliases
such as G63, C63S, M5CS and M340 still resolve to their canonical shop ranges. Re-run
against a JSON array of current `CatalogProduct` records with:

```sh
node scripts/audit-luper-catalog.mjs /path/to/catalog-products.json
```

The audit validates canonical destination matching, not every possible free-text
phrasing or fitment. Focused regressions cover N-LARGO routing, the typo, unrelated
N-LARGO models, brand carryover and unchanged API spending guards. Representative
full-catalogue part queries stayed below the existing 20 KB context bound.
