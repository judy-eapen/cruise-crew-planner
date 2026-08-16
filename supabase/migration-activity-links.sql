-- v4: official ticket-purchase link per activity. Additive only — safe to re-run.
alter table activities add column if not exists ticket_link text not null default '';
