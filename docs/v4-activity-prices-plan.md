# v4 Plan — Activity Ticket Links + Researched Prices

**Project:** Cruise Crew Planner · `~/Desktop/Projects/cruise-crew-planner`
**Live:** cruise-crew-planner.vercel.app · **Repo:** github.com/judy-eapen/cruise-crew-planner (push via `gh auth switch --user judy-eapen`, switch back to jdarvin-bright after)

## Goal (two parts)

1. **New field `ticket_link` on activities** — the official ticket-purchase page URL, shown to families as a "Tickets ↗" link on activity cards/rows (same pattern as hotels' `link` field: new-tab, stopPropagation inside buttons).
2. **Research real prices** for every paid activity — adult and child (ages 3–9) — using web search/fetch against official sources. Where pricing is **date-based** (Disney parks, Universal parks, SeaWorld, LEGOLAND, sometimes KSC), get the price for each of the FIVE relevant dates and load them into the existing `date_prices` jsonb column: **2026-10-31, 2026-11-01, 2026-11-06, 2026-11-07, 2026-11-08**. Flat-priced activities just get base adult/child prices.

## Part 1 — Code (small, do first)

- Types: `Activity.ticketLink: string` · seed: `""` · db mapper: `r.ticket_link ?? ""`
- Additive migration `supabase/migration-activity-links.sql`: `alter table activities add column if not exists ticket_link text not null default '';`
- Admin: input on each activity row (like hotels' 🔗 link input), included in update-activity payload/API
- UI: "Tickets ↗" link in the builder's per-day activity card area and/or browse-all table rows (open new tab; don't trigger row selection)

## Part 2 — Price research (the bulk of the session)

For each paid activity, find the OFFICIAL ticket page + current prices. Judy may paste links she already has — use hers first; search for the rest.

**Date-priced (get all 5 dates, adult + child 3–9, 1-day 1-park base ticket, tax-inclusive if shown):**
- Magic Kingdom (MK), Epcot (EP), Hollywood Studios (HS), Animal Kingdom (AK) — disneyworld.disney.go.com ticket calendar (prices vary by park AND date)
- Universal Studios (US), Islands of Adventure (IOA), Epic Universe (EPIC) — universalorlando.com (date-based; Epic runs premium)
- SeaWorld (SW) — seaworld.com/orlando (online date pricing, much cheaper than gate)
- LEGOLAND (LEGO) — legoland.com/florida
- Kennedy Space Center (KSC) — kennedyspacecenter.com (usually flat; verify)

**Flat-priced (base adult/child only):**
- Gatorland (GATOR), Discovery Cove (DC — date-based reservation pricing actually, treat as date-priced if feasible), Orlando Science Center (OSC), Crayola (CRAYOLA), WonderWorks (WW), Andretti Karting (KART), Winter Park Boat Tour (WPBOAT), Lake Eola swan boats (EOLA)

**Research reality check:** Disney/Universal price calendars are JS-heavy — WebFetch may not render them. Fallback order: (1) official site, (2) reputable current secondary sources (e.g., Undercover Tourist price pages, recent park-blog price charts) — if using a secondary source, note it and KEEP `estimate = true`; only official-confirmed prices clear the estimate flag. Child price = ages 3–9 tier. If a specific date's price can't be found, leave that date out of date_prices (base price is the fallback) rather than guessing.

## Part 3 — Load into the database

Produce ONE idempotent SQL file `supabase/update-activity-prices-<date>.sql` with per-activity UPDATE statements setting: `adult_price`, `child_price`, `date_prices` (jsonb for the 5 dates where applicable), `ticket_link`, and `estimate` (false only if official). **UPDATE only — never delete/recreate anything** (see feedback memory `no-destructive-migrations`). Judy runs it in the Supabase SQL Editor, then clicks 💾 Export backup in /admin.

Show Judy a summary table (activity × adult × child × per-date spread × source × confidence) BEFORE finalizing the SQL so she can sanity-check.

## Kickoff prompt for the new session

> Read `docs/v4-activity-prices-plan.md` in ~/Desktop/Projects/cruise-crew-planner and my memory for cruise-crew-planner. First build the ticket_link field (Part 1), then research all the activity prices per Part 2 (here are ticket links I already have: [PASTE ANY, OR SAY "search for all"]), show me the summary table, and generate the update SQL.
