-- Airbnb candidates transcribed from Judy's screenshots (2026-08-15).
-- 4 before-cruise houses (10/31→11/2 quotes) + 1 after-cruise (11/6→11/8).
-- 1-night windows left at 0 — these houses won't appear for options D/E/F (pre)
-- or B/E (post) until those windows are quoted. Split counts: 7 pre / 4 post
-- (planning assumptions — adjust in /admin). Run once; safe with existing rows.

insert into hotels (id, name, stay_pre2, stay_pre1, stay_post2, stay_post1, price_mode, stars, area, type, pool, breakfast_included, amenities, link, shared_families, bedrooms, beds, baths, sleeps, estimate) values
('AB1', 'Paradiso Grande 15BR (6091HS)', 3026, 0, 0, 0, 'per_property_night_split', 0, 'Paradiso Grande, Orlando', 'airbnb', false, false, '5.0 (13 reviews) · Guest favorite · verify total includes fees', 'https://www.airbnb.com/rooms/1417561307928198648', 7, 15, 19, 15.5, 0, false),
('AB2', 'Windsor Cay 10BR (Clermont)', 1313, 0, 0, 0, 'per_property_night_split', 0, 'Clermont · ~8 mi to Disney', 'airbnb', false, false, '5.0 (31 reviews) · Guest favorite · Harry Potter game room · price incl. all fees', 'https://www.airbnb.com/rooms/1186228742934854837', 7, 10, 12, 8, 16, false),
('AB3', 'Windsor Cay 10BR (16267 SK)', 1435, 0, 0, 0, 'per_property_night_split', 0, 'Clermont · ~8 mi to Disney', 'airbnb', true, false, '4.97 (31 reviews) · Toy Story room + slide · screened pool w/ child fence · price incl. all fees', 'https://www.airbnb.com/rooms/1166632353598701356', 7, 10, 13, 8, 16, false),
('AB4', 'Paradiso Grande 12BR (New)', 1532, 0, 0, 0, 'per_property_night_split', 0, 'Paradiso Grande · ~2 mi SeaWorld, ~6 mi Disney/Universal', 'airbnb', false, false, 'New listing · host discount applied', 'https://www.airbnb.com/rooms/1750384741785273839', 7, 12, 14, 8, 16, false),
('AB5', 'Paradiso Grande 10BR (after cruise)', 0, 0, 2651, 0, 'per_property_night_split', 0, 'Paradiso Grande · ~10 min to parks', 'airbnb', false, false, '4.83 (12 reviews) · themed rooms, game room, movie theater · real beds for 20', 'https://www.airbnb.com/rooms/1582628248017090270', 4, 10, 13, 9, 20, false);
