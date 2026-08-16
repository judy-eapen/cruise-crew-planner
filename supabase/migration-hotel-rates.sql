-- Adds per-stay hotel totals (the only four stays any option books).
-- Run this if your hotels table predates it. Safe to re-run.
-- Fresh schema.sql / migration-v2.sql already include these columns.

alter table hotels add column if not exists stay_pre2 numeric not null default 0;  -- Oct 31 -> Nov 2
alter table hotels add column if not exists stay_pre1 numeric not null default 0;  -- Nov 1 -> Nov 2
alter table hotels add column if not exists stay_post2 numeric not null default 0; -- Nov 6 -> Nov 8
alter table hotels add column if not exists stay_post1 numeric not null default 0; -- Nov 6 -> Nov 7
alter table hotels add column if not exists link text not null default '';
alter table hotels add column if not exists shared_families int not null default 7;
