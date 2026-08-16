-- v4d content: what each age group can do at each activity (kids 3-9 vs kids 10+).
-- UPDATE only, idempotent. Run AFTER supabase/migration-activity-age-notes.sql.
-- Heights as rough age guide: 34-36in = most 3yos · 40in = most 4-5yos · 42in = 5-6 · 48in = 7-8+.

update activities set
  age_notes_younger = 'Fantasyland is built for them — most rides no height limit; characters, parade, fireworks; Seven Dwarfs 38in',
  age_notes_older   = 'Space Mountain 44in, Big Thunder + Tiana''s 40in, TRON coaster 48in'
where id = 'MK';

update activities set
  age_notes_younger = 'Frozen Ever After + Nemo aquarium (no min), Kidcot craft stops around World Showcase',
  age_notes_older   = 'Guardians coaster 42in, Test Track + Soarin'' 40in, country-hopping snack crawl'
where id = 'EP';

update activities set
  age_notes_younger = 'Toy Story Land: Alien Saucers 32in, Slinky Dog 38in; Frozen + Muppets shows, Star Wars characters',
  age_notes_older   = 'Rise of the Resistance 40in, Smugglers Run 38in, Tower of Terror + Rock ''n'' Roller 48in'
where id = 'HS';

update activities set
  age_notes_younger = 'Safari, gorilla/tiger trails, Boneyard dig playground — no height limits; Na''vi River no min',
  age_notes_older   = 'Flight of Passage 44in, Expedition Everest 44in, Kali rapids 38in'
where id = 'AK';

update activities set
  age_notes_younger = 'Sesame Street land (rides low/no mins with adult), orca + dolphin shows, walk-through aquariums',
  age_notes_older   = 'Coaster park for them: Ice Breaker 48in, Manta/Mako/Kraken/Pipeline 54in'
where id = 'SW';

update activities set
  age_notes_younger = 'The whole park targets 2-12: Driving School, DUPLO land, junior coasters 36-40in, water play',
  age_notes_older   = 'Fun to about 12 (junior-scale thrills); teens find it tame'
where id = 'LEGO';

update activities set
  age_notes_younger = 'Gator feedings, petting zoo, train ride, splash pad — all ages',
  age_notes_older   = 'Screamin'' Gator zip line (add-on), breeding-marsh tower, wrestling shows'
where id = 'GATOR';

update activities set
  age_notes_younger = 'Planet Play indoor zone (ages 2-12), Rocket Garden, bus tour any age',
  age_notes_older   = 'Shuttle Atlantis + launch simulator 44in, Apollo/Saturn V center — lands hardest 8+'
where id = 'KSC';

update activities set
  age_notes_younger = 'KidsTown floor (under 7), dino dig, hands-on physics exhibits',
  age_notes_older   = 'Maker space, planetarium shows, engineering labs'
where id = 'OSC';

update activities set
  age_notes_younger = 'Built for ~2-10: melt-your-own crayon, wrap station, drawing studios, play zones',
  age_notes_older   = 'Fine for an hour alongside younger sibs; 12+ mostly done'
where id = 'CRAYOLA';

update activities set
  age_notes_younger = 'Bubble lab, hands-on floors, hurricane shaker; ropes course from 33in with an adult',
  age_notes_older   = 'Glow ropes course, laser tag, 6D motion ride, 360 bikes'
where id = 'WW';

update activities set
  age_notes_younger = 'Arcade + Mini Mario kart race ($15); laser tag from 42in; junior karts once ~48in',
  age_notes_older   = 'Full-speed electric kart races, VR, laser tag, racing sims'
where id = 'KART';

update activities set
  age_notes_younger = 'Shallow lagoons + walk-through aviary; dolphin swim requires age 6+',
  age_notes_older   = 'Snorkel the ray-and-fish reef, dolphin swim (6+), otter habitat'
where id = 'DC';

update activities set
  age_notes_younger = 'LEGO store, carousel, T-Rex Cafe, splash fountains',
  age_notes_older   = 'Shops, Splitsville arcade/bowling, food crawl'
where id = 'DS';

update activities set
  age_notes_younger = 'Dessert spots (Toothsome''s), Hollywood Drive-In mini golf, people-watching',
  age_notes_older   = 'Mini golf, movies, shops — easy low-key evening'
where id = 'CW';

update activities set
  age_notes_younger = 'Calm 1-hour lake cruise — all ages welcome; herons, gators, mansions',
  age_notes_older   = 'Relaxed scenic hour — good recovery-day pace'
where id = 'WPBOAT';

update activities set
  age_notes_younger = 'Gentle-slope beach, sandcastles, pier arcade',
  age_notes_older   = 'Boogie boarding, surf-lesson stands, Ron Jon Surf Shop'
where id = 'COCOA';

update activities set
  age_notes_younger = 'Sand + gentle surf all day; pack shade for the littles',
  age_notes_older   = 'Boogie boards; New Smyrna is the surfier pick'
where id = 'BEACH';

update activities set
  age_notes_younger = 'Swan boat ride with a parent, playground, feeding the real swans',
  age_notes_older   = 'They can help paddle; short stop, pair with ice cream downtown'
where id = 'EOLA';

update activities set
  age_notes_younger = 'Gelato + park lawns while parents browse',
  age_notes_older   = 'Shops and eats; scenic boat tour is a block away'
where id = 'PARKAVE';

update activities set
  age_notes_younger = 'Diagon Alley wand magic + shows, Minion Land, Animal Actors; Gringotts ride 42in',
  age_notes_older   = 'Gringotts 42in, Mummy 48in, Rip Ride Rockit 51in, Transformers 40in'
where id = 'US';

update activities set
  age_notes_younger = 'Seuss Landing is their zone; Flight of the Hippogriff 36in, Spider-Man 40in',
  age_notes_older   = 'Hagrid''s + Forbidden Journey 48in, VelociCoaster 51in — best big-kid lineup'
where id = 'IOA';

update activities set
  age_notes_younger = 'Yoshi 34in; Mario Kart, HP Ministry + Hiccup''s Wing Gliders all 40in — most 5yos ride the headliners',
  age_notes_older   = 'Stardust Racers, Monsters Unchained, Dragon Racer''s Rally — the 48in lineup'
where id = 'EPIC';
