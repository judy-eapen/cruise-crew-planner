-- Align the activity catalog with Judy's definitive list (2026-08-16).
-- Removes the 9 activities not on the list. None are referenced by sample
-- itineraries, so this is safe. Run once; then /admin -> Seed database to
-- add the missing ones (incl. Universal Epic Universe) without touching
-- any prices you've edited.

delete from activities where id in ('FUNSPOT','ICON','AIRBOAT','ESCAPE','TREK','OLDTOWN','OUTLETS','WEKIWA','BG');
