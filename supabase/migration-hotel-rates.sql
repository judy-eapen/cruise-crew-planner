-- Adds per-window hotel rates (before-cruise vs after-cruise pricing).
-- Run this if your hotels table has a single `price` column. Safe to re-run.

alter table hotels add column if not exists price_pre numeric;
alter table hotels add column if not exists price_post numeric;
update hotels set price_pre = coalesce(price_pre, price), price_post = coalesce(price_post, price);
alter table hotels alter column price drop not null;
