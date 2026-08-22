-- 2026-08-22: aircraft make/model on flight quotes (e.g. "Boeing 737", "Airbus A320").
-- Purely additive — existing rows keep plane = null and display without it.
-- Run in the Supabase SQL editor BEFORE deploying the app change.
alter table flights add column if not exists plane text;
