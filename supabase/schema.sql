-- Cruise Crew Planner — Supabase schema (v2)
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- Then use the app's /admin page ("Seed database") to load the data.
-- Already ran an older schema? Run supabase/migration-v2.sql instead.

create table if not exists date_options (
  id text primary key,
  label text not null,
  depart_date date not null,
  return_date date not null,
  pre_nights int not null,
  post_nights int not null,
  hotel_nights int not null
);

-- Real flight quotes: ~3 per option, cheapest surfaced first.
create table if not exists flights (
  id bigint generated always as identity primary key,
  option_id text not null references date_options(id),
  origin text not null,
  airline text not null default 'TBD',
  out_depart text default 'TBD',
  out_arrive text default 'TBD',
  ret_depart text default 'TBD',
  ret_arrive text default 'TBD',
  duration text default '~2h 15m',
  fare_per_person numeric not null,
  bag_fee numeric not null default 0,
  estimate boolean not null default true,
  price_checked text
);

create table if not exists hotels (
  id text primary key,
  name text not null,
  stay_pre2 numeric not null default 0,
  stay_pre1 numeric not null default 0,
  stay_post2 numeric not null default 0,
  stay_post1 numeric not null default 0,
  price_mode text not null default 'per_room_night' check (price_mode in ('per_room_night', 'per_property_night_split')),
  stars int not null default 3,
  area text not null default '',
  type text not null default 'hotel' check (type in ('hotel', 'airbnb')),
  pool boolean not null default false,
  breakfast_included boolean not null default false,
  amenities text not null default '',
  link text not null default '',
  shared_families int not null default 7,
  bedrooms int not null default 0,
  beds int not null default 0,
  baths numeric not null default 0,
  sleeps int not null default 0,
  cancellation text not null default '',
  estimate boolean not null default true
);

create table if not exists activities (
  id text primary key,
  name text not null,
  type text not null check (type in ('full', 'half')),
  adult_price numeric not null,
  child_price numeric not null,
  category text not null,
  age_fit text not null default 'all' check (age_fit in ('all', 'younger', 'older', 'check')),
  area text not null default 'orlando' check (area in ('orlando', 'port', 'daytrip')),
  star boolean not null default false,
  estimate boolean not null default true,
  note text,
  date_prices jsonb not null default '{}'::jsonb
);

create table if not exists itinerary_slots (
  option_id text not null references date_options(id),
  date date not null,
  day_label text not null,
  slot_type text not null check (slot_type in ('full', 'half', 'travel')),
  activity_id text references activities(id),
  primary key (option_id, date)
);

create table if not exists families (
  id text primary key,
  name text not null,
  adults int not null,
  kids_3_9 int not null,
  kids_10plus int not null,
  rooms int not null default 1,
  bags int not null default 2,
  placeholder boolean not null default false,
  token text unique not null
);

create table if not exists votes (
  family_id text primary key references families(id),
  first_choice text not null references date_options(id),
  second_choice text references date_options(id),
  comment text,
  updated_at timestamptz not null default now()
);

-- Lock everything down: RLS on, no policies for the anon role.
-- The app's server routes use the service-role key (which bypasses RLS),
-- so the API layer is the only doorway to this data.
alter table date_options enable row level security;
alter table flights enable row level security;
alter table hotels enable row level security;
alter table activities enable row level security;
alter table itinerary_slots enable row level security;
alter table families enable row level security;
alter table votes enable row level security;
