-- ONLY needed if you already ran migration-v2.sql BEFORE 2026-08-15 evening
-- (i.e. your flights table has depart_time/return_time instead of the four
-- leg-time columns). Fresh schema.sql / migration-v2.sql already include these.

alter table flights add column if not exists out_depart text default 'TBD';
alter table flights add column if not exists out_arrive text default 'TBD';
alter table flights add column if not exists ret_depart text default 'TBD';
alter table flights add column if not exists ret_arrive text default 'TBD';
alter table flights add column if not exists duration text default '~2h 15m';
