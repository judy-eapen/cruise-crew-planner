-- Discovery Cove correction (Judy's lookup, Aug 16): ~$250/ticket, ages 6+ only.
-- UPDATE only, idempotent.
update activities set
  adult_price = 250,
  child_price = 250,
  note = 'All-inclusive day resort; AGES 6+ ONLY — the 4-5yos can''t attend',
  age_notes_younger = 'Ages 6+ only — kids under 6 can''t enter; the 6-9s get shallow lagoons + the aviary',
  age_notes_older = 'Snorkel the ray-and-fish reef, otter habitat; dolphin swim is an add-on',
  estimate = true
where id = 'DC';
