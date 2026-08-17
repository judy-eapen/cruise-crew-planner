-- Family-saved builds: each family's curated per-option picks live on their row,
-- so any device that selects that family sees them. Additive only — safe to re-run.
alter table families add column if not exists builds jsonb not null default '{}'::jsonb;
