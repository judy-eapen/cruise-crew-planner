-- Adds the 7 activities missing from the live catalog (2026-08-16).
-- Idempotent: 'on conflict do nothing' means re-running never duplicates
-- and never touches rows/prices you've already edited.
-- Pair with cleanup-activities-2026-08-16.sql (removes the 9 unlisted ones).

insert into activities (id, name, type, adult_price, child_price, category, age_fit, area, star, estimate, note) values
('US',      'Universal Studios',        'full', 140, 135, 'Theme park',      'older', 'orlando', false, true,  'Harry Potter Diagon Alley; good for 8+, may be intense for the 4–6yos'),
('IOA',     'Islands of Adventure',     'full', 140, 135, 'Theme park',      'older', 'orlando', false, true,  'Harry Potter Hogsmeade + Hagrid coaster; best for the 10–13s'),
('EPIC',    'Universal Epic Universe',  'full', 160, 155, 'Theme park',      'all',   'orlando', false, true,  'The new park — Super Nintendo World + Harry Potter Ministry of Magic; book early'),
('EP',      'Epcot',                    'full', 140, 130, 'Theme park',      'older', 'orlando', false, true,  'Good for 8+; the 4–6yos may get restless (less ride-heavy)'),
('DC',      'Discovery Cove',           'full', 220, 220, 'Attraction',      'check', 'orlando', false, true,  'All-inclusive; reservation required; dolphin swim has age/height minimums'),
('EOLA',    'Lake Eola Park',           'half', 0,   10,  'Free / low cost', 'all',   'orlando', true,  true,  'Swan boats; especially nice for the youngest kids'),
('PARKAVE', 'Winter Park / Park Ave',   'half', 0,   0,   'Free / low cost', 'all',   'orlando', false, false, 'Shopping & dining; more geared to parents')
on conflict (id) do nothing;
