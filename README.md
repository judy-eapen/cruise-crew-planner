# 🏰 Cruise Crew Planner

A group trip planner for 28 people (14 adults, 14 kids) built around one fixed anchor: a Disney cruise, boarding Mon Nov 2 (afternoon) and disembarking Fri Nov 6 (9am).

Everything around the cruise is undecided — six possible flight windows (fly out Oct 31 or Nov 1 × fly back Nov 6, 7, or 8), three origin airports (IAD/DCA/BWI), Orlando activities for the non-cruise days, and hotels. Every family is a different size, and theme-park child pricing only covers ages 3–9, so **"which option is cheapest" has a different answer for every family**. Group chats can't hold that comparison; this app can.

> Pick your family → see YOUR total for each option → see the day-by-day plan → vote.

## Features

- **Compare** — six option cards grouped by departure date, with the selected family's all-in total (flights + hotel + activity tickets), cheapest/most-fun badges, and a stacked cost-breakdown chart
- **Itinerary** — per-option day-strip timeline (travel / cruise / activity days), sample activities with age-banded pricing, and a "copy summary for the group chat" button
- **Group** — all 7 families × 6 options cost matrix with group grand totals
- **Vote** *(coming in v1)* — per-family tokenized vote links, one editable vote per family, live results
- **Selectors** — origin airport, hotel tier, and family (presets or custom party) re-price everything live

## Pricing rules

- Kids 2+ pay adult **airfare**
- Park **child pricing = ages 3–9 only**; kids 10+ pay adult ticket prices
- Hotel = nightly rate × option's nights × family's rooms
- `~` marks estimated prices pending confirmation, with a "prices checked" freshness stamp

## Stack

Next.js (App Router, TypeScript, Tailwind) + Recharts. v0 runs on seed data in `src/data/trip.ts`; v1 moves data to Supabase and adds voting + an admin mode for price updates.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

Built as the Week 1 vibe-coding project for the Mastering Agentic AI Bootcamp (The Gen Academy), using Claude Code as the AI pair programmer. Family names in seed data are generic placeholders.
