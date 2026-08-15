-- Migration to v2 (2026-08-15): flight quotes, richer hotels/activities, family bags.
-- Run this if your database was created with the ORIGINAL schema.sql (or the
-- airlines migration). Flights and hotels held placeholder prices, so those two
-- tables are recreated; families and votes are preserved.
-- Afterward: /admin → "Seed database" to refill, then enter real quotes.

drop table if exists flights;
create table flights (
  id bigint generated always as identity primary key,
  option_id text not null references date_options(id),
  origin text not null,
  airline text not null default 'TBD',
  out_depart text default 'TBD',
  out_arrive text default 'TBD',
  ret_depart text default 'TBD',
  ret_arrive text default 'TBD',
  fare_per_person numeric not null,
  bag_fee numeric not null default 0,
  estimate boolean not null default true,
  price_checked text
);
alter table flights enable row level security;

drop table if exists hotels;
create table hotels (
  id text primary key,
  name text not null,
  price numeric not null,
  price_mode text not null default 'per_room_night' check (price_mode in ('per_room_night', 'per_property_night_split')),
  stars int not null default 3,
  area text not null default '',
  type text not null default 'hotel' check (type in ('hotel', 'airbnb')),
  pool boolean not null default false,
  breakfast_included boolean not null default false,
  amenities text not null default '',
  estimate boolean not null default true
);
alter table hotels enable row level security;

alter table activities add column if not exists age_fit text not null default 'all';
alter table activities add column if not exists area text not null default 'orlando';

alter table families add column if not exists bags int not null default 2;
