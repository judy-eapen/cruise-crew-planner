-- Adds per-night hotel rates (Oct 31 / Nov 1 / Nov 6 / Nov 7 — the only four
-- nights any option uses). Run this if your hotels table predates it. Safe to
-- re-run. Fresh schema.sql / migration-v2.sql already include these columns.

alter table hotels add column if not exists rate_oct31 numeric;
alter table hotels add column if not exists rate_nov1 numeric;
alter table hotels add column if not exists rate_nov6 numeric;
alter table hotels add column if not exists rate_nov7 numeric;
