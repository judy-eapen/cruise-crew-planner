# 🏰 Cruise Crew Planner

A group trip planner for 28 people (14 adults, 14 kids) built around one fixed anchor: a Disney cruise, boarding Mon Nov 2 (afternoon) and disembarking Fri Nov 6 (9am).

Everything around the cruise is undecided — six possible flight windows (fly out Oct 31 or Nov 1 × fly back Nov 6, 7, or 8), three origin airports (IAD/DCA/BWI), Orlando activities for the non-cruise days, and hotels. Every family is a different size, and theme-park child pricing only covers ages 3–9, so **"which option is cheapest" has a different answer for every family**. Group chats can't hold that comparison; this app can.

> Pick your family → see YOUR total for each option → see the day-by-day plan → vote.

## Features

- **Compare** — six option cards grouped by departure date, with the selected family's all-in total (flights + hotel + activity tickets), cheapest/most-fun badges, and a stacked cost-breakdown chart
- **Itinerary** — per-option day-strip timeline (travel / cruise / activity days), sample activities with age-banded pricing, and a "copy summary for the group chat" button
- **Group** — all 7 families × 6 options cost matrix with group grand totals
- **Vote** — per-family tokenized vote links (`/vote/<token>` — the link is the identity, no logins), one editable vote per family, live public results with turnout and per-family cards
- **Admin** (`/admin`, passcode-gated) — edit flight fares (auto-stamps the price-checked date), add/edit/remove hotels, update ticket prices, set real family compositions, copy each family's vote link, and seed the database
- **Selectors** — origin airport, hotel tier, and family (presets or custom party) re-price everything live

## Pricing rules

- Kids 2+ pay adult **airfare**
- Park **child pricing = ages 3–9 only**; kids 10+ pay adult ticket prices
- Hotel = nightly rate × option's nights × family's rooms
- `~` marks estimated prices pending confirmation, with a "prices checked" freshness stamp

## Stack

Next.js (App Router, TypeScript, Tailwind) + Recharts + Supabase.

**Data:** the app serves bundled seed data (`src/data/trip.ts`) until Supabase is connected, then reads everything from the database — so it works with zero configuration and upgrades in place. Setup guide: `SETUP-SUPABASE.md`.

**Security model:** row-level security denies the anonymous role entirely; every read/write goes through the app's server routes using the service-role key. Admin writes require a passcode (`ADMIN_PASSCODE` env var) checked server-side; votes require a family's secret token. Threat model is a friendly group — the transparency of public results is the real guardrail.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

Built as the Week 1 vibe-coding project for the Mastering Agentic AI Bootcamp (The Gen Academy), using Claude Code as the AI pair programmer. Family names in seed data are generic placeholders.
