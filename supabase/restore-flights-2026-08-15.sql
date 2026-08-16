-- Restores the 20 manually-entered flight quotes lost when migration-v2
-- recreated the flights table (2026-08-15). Transcribed from screenshots.
-- Run AFTER migration-v2.sql. Safe to run once; running twice duplicates rows
-- (delete duplicates in /admin if that happens).
--
-- Normalized while transcribing (flagged to Judy):
--  * United "back 11:45 PM" rows -> 11:45 AM (same flight shows AM elsewhere)
--  * Frontier option E "back 11:27 PM" -> 11:27 AM (same flight in option B)
--  * Option C row 2 airline showed "DCA" (an airport) -> restored as United
--    (times match the United pattern) — verify in /admin

insert into flights (option_id, origin, airline, out_depart, out_arrive, ret_depart, ret_arrive, duration, fare_per_person, bag_fee, estimate, price_checked) values
-- Option A · Oct 31 -> Nov 8
('A', 'BWI', 'Frontier',       '2:42 PM', '5:09 PM', '4:48 PM',  '7:09 PM',  '~2h 15m', 297, 50, false, '2026-08-15'),
('A', 'DCA', 'Delta',          '2:55 PM', '5:16 PM', '7:59 PM',  '10:09 PM', '~2h 20m', 306, 50, false, '2026-08-15'),
('A', 'DCA', 'United',         '1:45 PM', '4:15 PM', '11:45 AM', '1:59 PM',  '~2h 15m', 357, 50, false, '2026-08-15'),
('A', 'DCA', 'United',         '1:45 PM', '4:15 PM', '4:56 PM',  '7:14 PM',  '~2h 15m', 365, 50, false, '2026-08-15'),
-- Option B · Oct 31 -> Nov 7
('B', 'BWI', 'Frontier',       '2:42 PM', '5:09 PM', '11:27 AM', '1:47 PM',  '~2h 30m', 178, 50, false, '2026-08-15'),
('B', 'DCA', 'United',         '1:45 PM', '4:15 PM', '11:45 AM', '1:59 PM',  '~2h 30m', 257, 50, false, '2026-08-15'),
('B', 'DCA', 'Delta',          '2:55 PM', '5:16 PM', '10:25 AM', '12:36 PM', '~2h 20m', 271, 50, false, '2026-08-15'),
-- Option C · Oct 31 -> Nov 6
('C', 'BWI', 'Frontier',       '2:42 PM', '5:09 PM', '4:48 PM',  '7:09 PM',  '~2h 30m', 136, 50, false, '2026-08-15'),
('C', 'BWI', 'United',         '1:45 PM', '4:15 PM', '4:56 PM',  '7:14 PM',  '~2h 30m', 261, 50, false, '2026-08-15'),
('C', 'DCA', 'Delta',          '2:55 PM', '5:16 PM', '7:59 PM',  '10:09 PM', '~2h 21m', 295, 50, false, '2026-08-15'),
-- Option D · Nov 1 -> Nov 8
('D', 'DCA', 'Delta/Jetblue',  '2:55 PM', '5:16 PM', '5:40 PM',  '7:50 PM',  '~2h 20m', 347, 50, false, '2026-08-15'),
('D', 'BWI', 'Frontier',       '2:42 PM', '5:09 PM', '4:00 PM',  '6:32 PM',  '~2h 30m', 367, 50, false, '2026-08-15'),
('D', 'DCA', 'United',         '1:40 PM', '4:16 PM', '11:45 AM', '1:59 PM',  '~2h 36m', 411, 50, false, '2026-08-15'),
('D', 'DCA', 'Delta',          '2:55 PM', '5:16 PM', '10:25 AM', '12:36 PM', '~2h 20m', 422, 50, false, '2026-08-15'),
-- Option E · Nov 1 -> Nov 7
('E', 'BWI', 'Frontier',       '2:42 PM', '5:09 PM', '11:27 AM', '1:47 PM',  '~2h 27m', 263, 50, false, '2026-08-15'),
('E', 'DCA', 'Delta',          '2:55 PM', '5:16 PM', '10:25 AM', '12:36 PM', '~2h 21m', 272, 50, false, '2026-08-15'),
('E', 'DCA', 'United',         '1:40 PM', '4:16 PM', '11:45 AM', '1:59 PM',  '~2h 35m', 311, 50, false, '2026-08-15'),
-- Option F · Nov 1 -> Nov 6
('F', 'BWI', 'Frontier',       '2:42 PM', '5:09 PM', '6:39 PM',  '8:55 PM',  '~2h 27m', 232, 50, false, '2026-08-15'),
('F', 'DCA', 'Delta/Jetblue',  '2:55 PM', '5:16 PM', '5:40 PM',  '7:50 PM',  '~2h 21m', 294, 50, false, '2026-08-15'),
('F', 'DCA', 'Delta',          '2:55 PM', '5:16 PM', '7:59 PM',  '10:09 PM', '~2h 15m', 296, 50, false, '2026-08-15');
