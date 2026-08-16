-- v4 activity prices + official ticket links · researched 2026-08-16
-- UPDATE only — never deletes or recreates anything. Idempotent: safe to re-run.
-- Run AFTER supabase/migration-activity-links.sql (adds ticket_link).
-- Prices are pre-tax (FL 6.5%) except Winter Park Boat Tour (tax included).
-- child_price = ages 3-9 tier. estimate=false only where the official site confirmed the price.

-- ── Disney World ─ per-date 1-day 1-park prices from TouringPlans' 2026 charts
--    (secondary source → estimate stays true). Child = adult - $5 (Disney's rule).
update activities set
  adult_price = 194, child_price = 189,
  date_prices = '{"2026-10-31":{"adult":199,"child":194},"2026-11-01":{"adult":194,"child":189},"2026-11-06":{"adult":199,"child":194},"2026-11-07":{"adult":204,"child":199},"2026-11-08":{"adult":204,"child":199}}'::jsonb,
  ticket_link = 'https://disneyworld.disney.go.com/admission/tickets/',
  estimate = true
where id = 'MK';

update activities set
  adult_price = 189, child_price = 184,
  date_prices = '{"2026-10-31":{"adult":194,"child":189},"2026-11-01":{"adult":189,"child":184},"2026-11-06":{"adult":189,"child":184},"2026-11-07":{"adult":199,"child":194},"2026-11-08":{"adult":194,"child":189}}'::jsonb,
  ticket_link = 'https://disneyworld.disney.go.com/admission/tickets/',
  estimate = true
where id = 'EP';

update activities set
  adult_price = 189, child_price = 184,
  date_prices = '{"2026-10-31":{"adult":199,"child":194},"2026-11-01":{"adult":189,"child":184},"2026-11-06":{"adult":194,"child":189},"2026-11-07":{"adult":199,"child":194},"2026-11-08":{"adult":199,"child":194}}'::jsonb,
  ticket_link = 'https://disneyworld.disney.go.com/admission/tickets/',
  estimate = true
where id = 'HS';

update activities set
  adult_price = 169, child_price = 164,
  date_prices = '{"2026-10-31":{"adult":184,"child":179},"2026-11-01":{"adult":169,"child":164},"2026-11-06":{"adult":174,"child":169},"2026-11-07":{"adult":179,"child":174},"2026-11-08":{"adult":179,"child":174}}'::jsonb,
  ticket_link = 'https://disneyworld.disney.go.com/admission/tickets/',
  estimate = true
where id = 'AK';

-- ── Universal ─ Epic per-date from Universal's price calendar (via DisneyTouristBlog
--    screenshots, cross-checked YoY). Child = adult - $5. USF/IOA: no public per-date
--    calendar found → base-only estimate (official floor $124; Epic's uplift on these
--    dates suggests ~$155-170), left as estimate for Judy to true-up from universalorlando.com.
update activities set
  adult_price = 174, child_price = 169,
  date_prices = '{"2026-10-31":{"adult":179,"child":174},"2026-11-01":{"adult":179,"child":174},"2026-11-06":{"adult":174,"child":169},"2026-11-07":{"adult":184,"child":179},"2026-11-08":{"adult":184,"child":179}}'::jsonb,
  ticket_link = 'https://www.universalorlando.com/web/en/us/tickets-packages/park-tickets',
  estimate = true
where id = 'EPIC';

update activities set
  adult_price = 159, child_price = 154, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.universalorlando.com/web/en/us/tickets-packages/park-tickets',
  estimate = true
where id = 'US';

update activities set
  adult_price = 159, child_price = 154, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.universalorlando.com/web/en/us/tickets-packages/park-tickets',
  estimate = true
where id = 'IOA';

-- ── SeaWorld ─ single-day is one price for everyone 3+ (official floor $59.99;
--    resale calendars show ~$73 for fall dates). Date price unconfirmed → estimate.
update activities set
  adult_price = 73, child_price = 73, date_prices = '{}'::jsonb,
  ticket_link = 'https://seaworld.com/orlando/tickets/',
  estimate = true
where id = 'SW';

-- ── LEGOLAND ─ online date-based, everyone 2+ same price (official floor $69 online,
--    $129 gate). Halloween-weekend date price unconfirmed → estimate.
update activities set
  adult_price = 89, child_price = 89, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.legoland.com/florida/tickets-passes/tickets/',
  estimate = true
where id = 'LEGO';

-- ── Kennedy Space Center ─ OFFICIAL flat pricing: adult (12+) $77, child (3-11) $67.
--    (Our model charges 10-11yos the adult $77 — slight overestimate.)
update activities set
  adult_price = 77, child_price = 67, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.kennedyspacecenter.com/info/tickets',
  estimate = false
where id = 'KSC';

-- ── Gatorland ─ gate $34.99 adult (13+) / $24.99 child (3-12); ~$3 less online.
update activities set
  adult_price = 35, child_price = 25, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.gatorland.com/tickets/',
  estimate = true
where id = 'GATOR';

-- ── Discovery Cove ─ Day Resort (no dolphin swim) runs ~$200-280 by date, all-inclusive
--    food/drink + 14-day SeaWorld/Aquatica admission. Date price unconfirmed → estimate.
update activities set
  adult_price = 230, child_price = 230, date_prices = '{}'::jsonb,
  ticket_link = 'https://discoverycove.com/orlando/pricing/',
  estimate = true
where id = 'DC';

-- ── Orlando Science Center ─ OFFICIAL online: adult (18+) $29, youth (2-12) $22.
--    (Teens 13-17 are $27; our model charges them $29 — slight overestimate.)
update activities set
  adult_price = 29, child_price = 22, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.osc.org/visit/',
  estimate = false
where id = 'OSC';

-- ── Crayola Experience ─ OFFICIAL: $30.99 + tax everyone 3+, $3 off online → $27.99.
update activities set
  adult_price = 28, child_price = 28, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.crayolaexperience.com/orlando/buy-tickets',
  estimate = false
where id = 'CRAYOLA';

-- ── WonderWorks ─ All Access ~$36.99 adult / $28.99 child (4-12) + tax (aggregator-
--    confirmed; official site blocked our check) → estimate.
update activities set
  adult_price = 37, child_price = 29, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.wonderworksonline.com/orlando/tickets/',
  estimate = true
where id = 'WW';

-- ── Andretti Karting ─ OFFICIAL single race: adult/intermediate $29, junior $19
--    (42" min height). Modeled as one race each; real spend varies (Thrill Pkg $59) → estimate.
update activities set
  adult_price = 29, child_price = 19, date_prices = '{}'::jsonb,
  ticket_link = 'https://andrettikarting.com/orlando/pricing',
  estimate = true
where id = 'KART';

-- ── Winter Park Scenic Boat Tour ─ OFFICIAL, tax included: adult $20, child (2-11) $10.
update activities set
  adult_price = 20, child_price = 10, date_prices = '{}'::jsonb,
  ticket_link = 'https://scenicboattours.com/',
  estimate = false
where id = 'WPBOAT';

-- ── Lake Eola swan boats ─ $15 per boat / 30 min (seats 5, card only). Modeled as
--    ~$8 per kid 3-9 (≈2 kids/family share a boat with a parent) → estimate.
update activities set
  adult_price = 0, child_price = 8, date_prices = '{}'::jsonb,
  ticket_link = 'https://www.orlando.gov/Parks-the-Environment/Directory/Lake-Eola-Park/Rent-a-Swan-Boat-at-Lake-Eola',
  estimate = true
where id = 'EOLA';
