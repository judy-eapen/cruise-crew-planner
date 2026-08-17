-- Discovery Cove clarified (Judy's lookup, Aug 16): Day Resort admission is all
-- ages 3+ (~$230 by date); the DOLPHIN SWIM package is ~$250 and swimmers must be 6+.
-- UPDATE only, idempotent. Supersedes the earlier version of this file.
update activities set
  adult_price = 230,
  child_price = 230,
  note = 'All-inclusive Day Resort, ages 3+; dolphin-swim package ~$250 and swimmers must be 6+',
  age_notes_younger = 'Day Resort works for 3+ (shallow lagoons, aviary, all food/drink); the dolphin SWIM needs age 6+',
  age_notes_older = 'Dolphin-swim package (~$250, ages 6+), snorkel the ray-and-fish reef, otter habitat',
  estimate = true
where id = 'DC';
