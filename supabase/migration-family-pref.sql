-- Per-family preferred airline (defaults pick that airline's cheapest flight).
-- Additive; safe to re-run.
alter table families add column if not exists preferred_airline text not null default '';
