-- v4d: per-age-group guidance on activities. Additive only — safe to re-run.
alter table activities add column if not exists age_notes_younger text not null default '';
alter table activities add column if not exists age_notes_older text not null default '';
