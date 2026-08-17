-- Add Hyatt Place Titusville / Kennedy Space Center as a pre-cruise hotel option
-- near the port (Google Hotels quotes, checked 2026-08-17):
--   Oct 31 → Nov 2 (2 nights): $116/night → $232 stay total
--   Nov 1  → Nov 2 (1 night):  $134 stay total
-- Post-cruise stays left at 0 so it only appears in the before-cruise picker.
-- Additive insert only; safe to re-run (upsert on id).

insert into hotels (
  id, name, stay_pre2, stay_pre1, stay_post2, stay_post1,
  price_mode, stars, area, type, pool, breakfast_included,
  amenities, link, shared_families, bedrooms, beds, baths, sleeps,
  cancellation, estimate
) values (
  'Hkschyatt',
  'Hyatt Place Titusville / Kennedy Space Center',
  232, 134, 0, 0,
  'per_room_night', 3,
  'Titusville — near Kennedy Space Center / Port Canaveral',
  'hotel', true, true,
  'Free breakfast, free parking, pool, free Wi-Fi, fitness center, bar',
  '', 7, 0, 0, 0, 0,
  '', false
)
on conflict (id) do update set
  name = excluded.name,
  stay_pre2 = excluded.stay_pre2,
  stay_pre1 = excluded.stay_pre1,
  area = excluded.area,
  amenities = excluded.amenities;
