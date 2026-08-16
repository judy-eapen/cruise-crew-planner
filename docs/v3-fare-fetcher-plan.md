# v3 Plan — Dynamic Airfare via SerpApi Google Flights ("Refresh fares" button)

> ⚠ Provider changed 2026-08-16: Amadeus decommissioned its self-service portal on
> July 17, 2026 (Enterprise-only now). SerpApi's Google Flights API replaces it —
> self-serve, free tier ~100 flight searches/mo, $25/mo for 1,000. Bonus: it returns
> exactly what Google Flights shows (incl. Southwest, which Amadeus lacked) and the
> aircraft model per flight (making the 737 MAX 8 exclusion reliable).

**Project:** Cruise Crew Planner · `~/Desktop/Projects/cruise-crew-planner`
**Live:** cruise-crew-planner.vercel.app · **Repo:** github.com/judy-eapen/cruise-crew-planner (push via `gh auth switch --user judy-eapen`, then switch back to jdarvin-bright)
**Stack:** Next.js App Router + Supabase (service-role via server routes only; RLS denies anon). Admin at /admin (passcode = ADMIN_PASSCODE env, sent as x-admin-passcode header).

## Goal

An admin **"↻ Refresh fares"** button that queries SerpApi's Google Flights API and fills the `flights` table with the **top 5 cheapest nonstop round-trip quotes per date option** (pooled across IAD/DCA/BWI → MCO), plus a **pinned cheapest Delta quote** per option if Delta isn't already in the top 5. Manual quotes must never be touched.

## Prerequisites (Judy, ~5 min)

1. Free account at **serpapi.com** → dashboard → copy your **API key**
2. Add env var in Vercel (+ `.env.local` for local dev): `SERPAPI_KEY`
3. Budget awareness: one full refresh ≈ 30–55 searches (18 base + return-leg detail calls). Free tier ≈ 100/mo → ~2 refreshes; the $25/mo tier (1,000) comfortably covers weekly refreshes.

## Search policy (Judy's requirements — confirm/fill her filters before building)

- Exact date pairs from `date_options` (6 options, e.g. A = 2026-10-31 → 2026-11-08)
- Engine: `engine=google_flights`, `departure_id=BWI|DCA|IAD`, `arrival_id=MCO`, `outbound_date`/`return_date`, `adults=1` (fares stored per person, round-trip total), `currency=USD`, `stops=1` (SerpApi's value for nonstop-only)
- **Time windows:** ⚠ JUDY WILL SUPPLY HER FILTERS — SerpApi supports `outbound_times` / `return_times` (e.g. `"10,18"` = depart 10am–6pm). For options C/F, return must depart ≥ ~1:00 PM (off ship 9am).
- **Exclude Boeing 737 MAX 8:** each returned flight has an `airplane` field — drop itineraries containing "737 MAX 8". (Still note on the page: scheduled equipment; airlines can swap planes.)
- **Delta pin:** per option, one extra search with `include_airlines=DL`; if its cheapest isn't already in the top 5, append it (badge "◆ Delta" optional).
- **Round-trip mechanics:** the first call returns outbound legs with full round-trip prices; fetching the matched return leg's times requires a follow-up call with that leg's `departure_token`. Strategy: pool all outbounds per option, keep the top ~3 cheapest + cheapest Delta, then make token calls only for those (~18 base + ~20 detail calls per refresh).
- Bag fees: keep the **$50/bag round-trip assumption** (bag_fee column default); Google fares exclude checked bags on most basic fares.
- Southwest appears in Google Flights results, so BWI Southwest fares CAN come from the API (mark bag_fee 0 when airline is Southwest).

## Data safety (non-negotiable — see feedback memory `no-destructive-migrations`)

1. **Additive migration only:** `alter table flights add column if not exists source text not null default 'manual';`
2. Refresh logic: `delete from flights where source = 'api'` then insert fresh api rows. **Rows with source='manual' are never deleted or modified.**
3. Before first run: click 💾 Export backup in /admin.

## Implementation steps

1. **Migration** `supabase/migration-flight-source.sql` (the alter above) — Judy runs it in the SQL Editor.
2. **SerpApi client** `src/lib/serpapi.ts`: plain GET https://serpapi.com/search with query params (no OAuth). Map response: fare = `price` on the itinerary (round-trip, per adult, incl. taxes); out leg times from `flights[0].departure_airport.time` / `arrival_airport.time` (format to "2:42 PM"); return leg from the departure_token follow-up; duration from `total_duration` minutes ("~2h 27m"); airline = `flights[0].airline` (normalize to match manual rows: "Frontier", "Delta", "United", "Southwest").
3. **API route:** new admin action `refresh-fares` in /api/admin (passcode-gated). Sequential loop: for each of 6 options → 3 origin searches + 1 Delta search, pool outbounds, token-call the finalists → filter MAX 8 → sort by fare → top 5 (+ Delta pin) → delete old api rows for that option → insert (source='api', estimate=false, price_checked=today, bag_fee=50, or 0 for Southwest). Return per-option counts + errors for the UI. Consider a per-option "refresh just this option" button too (~6 calls) to stretch the free tier.
4. **Admin UI:** "↻ Refresh fares" button in the Flight quotes section with a running status ("Option C: 5 quotes ✓"), and a `source` chip on each quote row (✍️ manual / 🤖 api). Manual rows keep their edit/delete controls.
5. **Vercel note:** route may take 30–60s → set `export const maxDuration = 60` on the route (Hobby plan allows 60s), or batch per-option calls from the client.
6. **Verify:** run once, eyeball against Google Flights, then Export backup again.

## Known caveats
- SerpApi scrapes Google Flights: prices match what Judy sees manually (that's a feature), but an occasional search can be slow (5–15s) or transiently fail — retry once, and surface per-option errors instead of failing the whole refresh.
- Free tier ≈ 100 searches/mo → ~2 full refreshes; upgrade to $25/mo (1,000) if weekly refreshes are wanted, or use per-option refresh buttons.
- Keep airline names consistent with existing manual rows ("Frontier", "Delta", "United", "Southwest").

## Kickoff prompt for the new session

> Read `docs/v3-fare-fetcher-plan.md` in ~/Desktop/Projects/cruise-crew-planner and my memory file for cruise-crew-planner, then build the Amadeus fare fetcher exactly per the plan. My search filters are: [PASTE YOUR TIME WINDOWS / FILTERS HERE]. My Amadeus keys are set in Vercel and .env.local.
