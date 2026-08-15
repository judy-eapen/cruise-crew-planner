-- Cruise Crew Planner — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- Then use the app's /admin page ("Seed database") to load the data.

create table if not exists date_options (
  id text primary key,
  label text not null,
  depart_date date not null,
  return_date date not null,
  pre_nights int not null,
  post_nights int not null,
  hotel_nights int not null
);

create table if not exists flights (
  option_id text not null references date_options(id),
  origin text not null,
  airline text not null default 'TBD',
  fare_per_person numeric not null,
  estimate boolean not null default true,
  price_checked text,
  primary key (option_id, origin, airline)
);

create table if not exists hotels (
  id text primary key,
  name text not null,
  nightly_rate numeric not null,
  breakfast_included boolean not null default false,
  estimate boolean not null default true
);

create table if not exists activities (
  id text primary key,
  name text not null,
  type text not null check (type in ('full', 'half')),
  adult_price numeric not null,
  child_price numeric not null,
  category text not null,
  star boolean not null default false,
  estimate boolean not null default true,
  note text
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
