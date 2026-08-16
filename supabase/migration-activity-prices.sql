-- Per-date activity pricing (Disney calendar prices). Additive; safe to re-run.
alter table activities add column if not exists date_prices jsonb not null default '{}'::jsonb;
