-- v3: flight quotes carry their origin story. Additive only — safe to re-run.
-- 'manual' = hand-entered (never touched by the fare fetcher) · 'api' = SerpApi
-- (replaced wholesale on each refresh). Existing rows default to 'manual' = protected.
alter table flights add column if not exists source text not null default 'manual';
