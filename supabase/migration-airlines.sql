-- Migration (2026-08-15): multiple airline fares per option + origin.
-- Only needed if you created the flights table BEFORE this date.
-- Fares in the old table were placeholders, so we recreate it, then
-- re-seed from the app: /admin → "Seed database" (safe — keeps families/votes).

drop table if exists flights;

create table flights (
  option_id text not null references date_options(id),
  origin text not null,
  airline text not null default 'TBD',
  fare_per_person numeric not null,
  estimate boolean not null default true,
  price_checked text,
  primary key (option_id, origin, airline)
);

alter table flights enable row level security;
