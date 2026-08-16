-- v4b: ⭐ now means "top pick" — the curated 5-7 shown first everywhere.
-- UPDATE only, idempotent. Curated for this group (7 kids aged 3-9, 2-3 free days,
-- Nov 6 disembark near port). Swap picks anytime with the ⭐ toggle in /admin.
update activities set star = (id in ('MK','SW','EPIC','GATOR','KSC','DS','COCOA'));
