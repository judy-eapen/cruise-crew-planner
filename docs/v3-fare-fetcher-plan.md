# v3 Plan — Dynamic Airfare via Amadeus API ("Refresh fares" button)

**Project:** Cruise Crew Planner · `~/Desktop/Projects/cruise-crew-planner`
**Live:** cruise-crew-planner.vercel.app · **Repo:** github.com/judy-eapen/cruise-crew-planner (push via `gh auth switch --user judy-eapen`, then switch back to jdarvin-bright)
**Stack:** Next.js App Router + Supabase (service-role via server routes only; RLS denies anon). Admin at /admin (passcode = ADMIN_PASSCODE env, sent as x-admin-passcode header).

## Goal

An admin **"↻ Refresh fares"** button that queries the Amadeus Flight Offers Search API and fills the `flights` table with the **top 5 cheapest nonstop round-trip quotes per date option** (pooled across IAD/DCA/BWI → MCO), plus a **pinned cheapest Delta quote** per option if Delta isn't already in the top 5. Manual quotes must never be touched.

## Prerequisites (Judy, ~10 min)

1. Free account at **developers.amadeus.com** → My Self-Service Workspace → Create app → copy **API Key** + **API Secret** (start with the **test** environment; upgrade to production keys later if quotes look too stale/sparse)
2. Add env vars in Vercel (+ `.env.local` for local dev):
   - `AMADEUS_CLIENT_ID`
   - `AMADEUS_CLIENT_SECRET`
   - optional `AMADEUS_ENV=test` (switch to `production` later; base URL test.api.amadeus.com vs api.amadeus.com)

## Search policy (Judy's requirements — confirm/fill her filters before building)

- Exact date pairs from `date_options` (6 options, e.g. A = 2026-10-31 → 2026-11-08)
- Origins: IAD, DCA, BWI → destination MCO; round trip; `nonStop=true`; `currencyCode=USD`; `adults=1` (fares stored per person)
- **Time windows:** ⚠ JUDY WILL SUPPLY HER FILTERS (e.g., outbound depart 10am–6pm; for options C/F the RETURN must depart ≥ ~1:00 PM — off ship 9am). Use the POST search body's `originDestinations[].departureDateTimeRange.time` + `timeWindow`, or post-filter.
- **Exclude Boeing 737 MAX 8:** drop any offer whose segments include aircraft code `7M8` (check dictionaries.aircraft in the response). Note on the page: filter applies to *scheduled* equipment; airlines can swap planes.
- **Delta pin:** per option, run one extra search with `includedAirlineCodes=DL`; if its cheapest isn't already in the top 5, append it (badge "◆ Delta" in the UI is optional).
- Bag fees: keep the **$50/bag round-trip assumption** (bag_fee column default); Amadeus doesn't return them reliably.

## Data safety (non-negotiable — see feedback memory `no-destructive-migrations`)

1. **Additive migration only:** `alter table flights add column if not exists source text not null default 'manual';`
2. Refresh logic: `delete from flights where source = 'api'` then insert fresh api rows. **Rows with source='manual' are never deleted or modified.**
3. Before first run: click 💾 Export backup in /admin.

## Implementation steps

1. **Migration** `supabase/migration-flight-source.sql` (the alter above) — Judy runs it in the SQL Editor.
2. **Amadeus client** `src/lib/amadeus.ts`: OAuth2 client-credentials token (POST /v1/security/oauth2/token, cache ~25 min), and `searchOffers(params)` wrapper for GET/POST /v2/shopping/flight-offers. Map response: fare = `price.grandTotal` (per adult, incl. taxes); out/ret depart+arrive times from itineraries[].segments (format "2:42 PM"); duration from itineraries[].duration (PT2H27M → "~2h 27m"); airline = dictionaries.carriers[validatingAirlineCodes[0]] title-cased (e.g. "DELTA AIR LINES" → "Delta").
3. **API route:** new admin action `refresh-fares` in /api/admin (passcode-gated). Sequential loop (rate-limit friendly): for each of 6 options → 3 origin searches + 1 Delta search (~24 calls). Filter MAX 8 + time windows → pool → sort by farePerPerson → top 5 (+ Delta pin) → delete old api rows for that option → insert (source='api', estimate=false, price_checked=today, bag_fee=50). Return per-option counts + errors for the UI.
4. **Admin UI:** "↻ Refresh fares" button in the Flight quotes section with a running status ("Option C: 5 quotes ✓"), and a `source` chip on each quote row (✍️ manual / 🤖 api). Manual rows keep their edit/delete controls.
5. **Vercel note:** route may take 30–60s → set `export const maxDuration = 60` on the route (Hobby plan allows 60s), or batch per-option calls from the client.
6. **Verify:** run once, eyeball against Google Flights, then Export backup again.

## Known caveats
- Amadeus **test env** data is cached/limited — fine for wiring; production keys give real GDS fares (still ≠ Kayak to the dollar; the app already frames prices as ~estimates confirmed at booking).
- Southwest (WN) does not distribute via Amadeus — BWI Southwest fares won't appear; enter those manually (source='manual' protects them).
- Keep quotes' airline names consistent with existing manual rows ("Frontier", "Delta", "United").

## Kickoff prompt for the new session

> Read `docs/v3-fare-fetcher-plan.md` in ~/Desktop/Projects/cruise-crew-planner and my memory file for cruise-crew-planner, then build the Amadeus fare fetcher exactly per the plan. My search filters are: [PASTE YOUR TIME WINDOWS / FILTERS HERE]. My Amadeus keys are set in Vercel and .env.local.
