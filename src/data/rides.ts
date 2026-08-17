// Ride height requirements — verified 2026-08-17. Sources per park:
//   usf/ioa — Universal's official Rider Safety guide PDF (effective Aug 6 2026);
//             Rip Ride Rockit + Fast & Furious Supercharged closed (absent from it)
//   epic    — Universal's official Epic Universe Safety guide PDF (Oct 4 2025)
//   mk/epcot/hs/ak — TouringPlans + MouseHacking (May 2026), full agreement;
//             Big Thunder LOWERED to 38" at its May 2026 reopening; DINOSAUR closed
//   sw      — seaworld.com official ride pages
//   lego    — 3 trackers incl. Mar 2026 list; Galacticoaster new for 2026
// Heights in inches; minHeight null = any height.

export type ParkId = "usf" | "ioa" | "epic" | "mk" | "epcot" | "hs" | "ak" | "lego" | "sw";

export interface Park {
  id: ParkId;
  name: string;
  short: string;
  emoji: string;
  available: boolean; // false = data not loaded yet, chip shows "soon"
  note?: string;
}

export const PARKS: Park[] = [
  { id: "usf", name: "Universal Studios Florida", short: "Universal Studios", emoji: "🎬", available: true, note: "Universal rule: kids under 48″ ride with an adult along" },
  { id: "ioa", name: "Islands of Adventure", short: "Islands of Adventure", emoji: "🦖", available: true, note: "Universal rule: kids under 48″ ride with an adult along" },
  { id: "epic", name: "Universal Epic Universe", short: "Epic Universe", emoji: "🌌", available: true, note: "Universal rule: kids under 48″ ride with an adult along" },
  { id: "mk", name: "Magic Kingdom", short: "Magic Kingdom", emoji: "🏰", available: true, note: "Disney rule: kids under age 7 ride with someone 14+" },
  { id: "epcot", name: "Epcot", short: "Epcot", emoji: "🌐", available: true, note: "Disney rule: kids under age 7 ride with someone 14+" },
  { id: "hs", name: "Disney's Hollywood Studios", short: "Hollywood Studios", emoji: "🎥", available: true, note: "Disney rule: kids under age 7 ride with someone 14+" },
  { id: "ak", name: "Disney's Animal Kingdom", short: "Animal Kingdom", emoji: "🦁", available: true, note: "Disney rule: kids under age 7 ride with someone 14+" },
  { id: "lego", name: "LEGOLAND Florida", short: "Legoland", emoji: "🧱", available: true, note: "Built for ages 2–12 — most rides allow small kids with an adult" },
  { id: "sw", name: "SeaWorld Orlando", short: "SeaWorld", emoji: "🐬", available: true, note: "Big coasters are 54″; Sesame Street Land covers the littles" },
];

// Trip activities (data/trip.ts + DB ids) that are theme parks with ride data.
export const ACTIVITY_PARK: Record<string, ParkId> = {
  US: "usf",
  IOA: "ioa",
  EPIC: "epic",
  MK: "mk",
  EP: "epcot",
  HS: "hs",
  AK: "ak",
  LEGO: "lego",
  SW: "sw",
};

/** Park for an activity id, only if its ride data is loaded (chip-worthy). */
export function parkForActivity(activityId: string | null | undefined): Park | null {
  if (!activityId) return null;
  const parkId = ACTIVITY_PARK[activityId];
  const park = parkId ? PARKS.find((p) => p.id === parkId) : undefined;
  return park?.available ? park : null;
}

export type RideKind = "coaster" | "dark" | "water" | "family" | "kiddie";

export interface Ride {
  id: string;
  park: ParkId;
  name: string;
  land: string;
  minHeight: number | null; // inches to ride at all (with an adult along)
  maxHeight?: number; // rare: Pteranodon Flyers
  kind: RideKind;
  thrill: 1 | 2 | 3; // 1 = gentle, 2 = moderate, 3 = intense
  note?: string;
}

export const RIDES: Ride[] = [
  // ── Universal Studios Florida ──────────────────────────────────────────────
  { id: "usf-hogwarts", park: "usf", name: "Hogwarts Express — King's Cross", land: "Diagon Alley", minHeight: null, kind: "family", thrill: 1, note: "Needs a park-to-park ticket (rides to Islands of Adventure)" },
  { id: "usf-villaincon", park: "usf", name: "Villain-Con Minion Blast", land: "Minion Land", minHeight: null, kind: "family", thrill: 1, note: "Moving-walkway blaster game — everyone plays" },
  { id: "usf-et", park: "usf", name: "E.T. Adventure", land: "World Expo", minHeight: 34, kind: "dark", thrill: 1, note: "Gentle classic — great first 'real ride' for the littles" },
  { id: "usf-trolls", park: "usf", name: "Trolls Trollercoaster", land: "DreamWorks Land", minHeight: 36, kind: "kiddie", thrill: 1, note: "Kiddie coaster sized for the 4–6yo crowd" },
  { id: "usf-minion", park: "usf", name: "Despicable Me Minion Mayhem", land: "Minion Land", minHeight: 40, kind: "dark", thrill: 1, note: "Motion simulator; stationary seats available below 40″" },
  { id: "usf-fallon", park: "usf", name: "Race Through New York (Jimmy Fallon)", land: "New York", minHeight: 40, kind: "dark", thrill: 1 },
  { id: "usf-kang", park: "usf", name: "Kang & Kodos' Twirl 'n' Hurl", land: "Springfield", minHeight: null, kind: "kiddie", thrill: 1, note: "Dumbo-style alien spinner" },
  { id: "usf-simpsons", park: "usf", name: "The Simpsons Ride", land: "Springfield", minHeight: 40, kind: "dark", thrill: 2, note: "Big motion simulator — skip if anyone's queasy" },
  { id: "usf-transformers", park: "usf", name: "Transformers: The Ride-3D", land: "Production Central", minHeight: 40, kind: "dark", thrill: 2, note: "Intense 3D screens — fine height-wise at 40″, but loud" },
  { id: "usf-gringotts", park: "usf", name: "Escape from Gringotts", land: "Diagon Alley", minHeight: 42, kind: "coaster", thrill: 2, note: "Coaster + 3D dark ride — the must-do of this park" },
  { id: "usf-mib", park: "usf", name: "Men in Black: Alien Attack", land: "World Expo", minHeight: 42, kind: "dark", thrill: 2, note: "Spinning laser-tag ride — big hit with 6–12yos" },
  { id: "usf-mummy", park: "usf", name: "Revenge of the Mummy", land: "New York", minHeight: 48, kind: "coaster", thrill: 3, note: "Dark indoor coaster with fire effects — 10+ territory" },

  // ── Islands of Adventure ───────────────────────────────────────────────────
  { id: "ioa-carousel", park: "ioa", name: "Caro-Seuss-el", land: "Seuss Landing", minHeight: null, kind: "kiddie", thrill: 1 },
  { id: "ioa-onefish", park: "ioa", name: "One Fish, Two Fish, Red Fish, Blue Fish", land: "Seuss Landing", minHeight: null, kind: "kiddie", thrill: 1, note: "Dumbo-style spinner — you WILL get squirted" },
  { id: "ioa-stormforce", park: "ioa", name: "Storm Force Accelatron", land: "Marvel Super Hero Island", minHeight: null, kind: "family", thrill: 1, note: "Teacup spinner" },
  { id: "ioa-hogwarts", park: "ioa", name: "Hogwarts Express — Hogsmeade", land: "Hogsmeade", minHeight: null, kind: "family", thrill: 1, note: "Needs a park-to-park ticket (rides to Universal Studios)" },
  { id: "ioa-cat", park: "ioa", name: "The Cat in the Hat", land: "Seuss Landing", minHeight: 36, kind: "dark", thrill: 1 },
  { id: "ioa-hippogriff", park: "ioa", name: "Flight of the Hippogriff", land: "Hogsmeade", minHeight: 36, kind: "kiddie", thrill: 1, note: "The littles' Harry Potter coaster" },
  { id: "ioa-trolley", park: "ioa", name: "High in the Sky Seuss Trolley", land: "Seuss Landing", minHeight: 36, kind: "kiddie", thrill: 1 },
  { id: "ioa-kong", park: "ioa", name: "Skull Island: Reign of Kong", land: "Skull Island", minHeight: 36, kind: "dark", thrill: 2, note: "Tall enough at 36″, but genuinely scary-dark — know your kid" },
  { id: "ioa-pteranodon", park: "ioa", name: "Pteranodon Flyers", land: "Jurassic Park", minHeight: 36, maxHeight: 56, kind: "kiddie", thrill: 1, note: "Kids-first ride: adults may only ride WITH a 36–56″ child" },
  { id: "ioa-spiderman", park: "ioa", name: "The Amazing Adventures of Spider-Man", land: "Marvel Super Hero Island", minHeight: 40, kind: "dark", thrill: 2, note: "All-time great 3D dark ride" },
  { id: "ioa-river", park: "ioa", name: "Jurassic Park River Adventure", land: "Jurassic Park", minHeight: 42, kind: "water", thrill: 2, note: "85-ft splashdown finale — you get wet" },
  { id: "ioa-popeye", park: "ioa", name: "Popeye & Bluto's Bilge-Rat Barges", land: "Toon Lagoon", minHeight: 42, kind: "water", thrill: 2, note: "Soaked, not splashed — bring ponchos or dry clothes" },
  { id: "ioa-ripsaw", park: "ioa", name: "Dudley Do-Right's Ripsaw Falls", land: "Toon Lagoon", minHeight: 44, kind: "water", thrill: 2 },
  { id: "ioa-forbidden", park: "ioa", name: "Harry Potter and the Forbidden Journey", land: "Hogsmeade", minHeight: 48, kind: "dark", thrill: 3, note: "Inside Hogwarts castle — intense motion, worth it" },
  { id: "ioa-hagrid", park: "ioa", name: "Hagrid's Magical Creatures Motorbike Adventure", land: "Hogsmeade", minHeight: 48, kind: "coaster", thrill: 3, note: "Best coaster at the resort — ride it at rope drop" },
  { id: "ioa-veloci", park: "ioa", name: "Jurassic World VelociCoaster", land: "Jurassic Park", minHeight: 51, kind: "coaster", thrill: 3, note: "70 mph, two launches — the big kids' bragging rights" },
  { id: "ioa-doom", park: "ioa", name: "Doctor Doom's Fearfall", land: "Marvel Super Hero Island", minHeight: 52, kind: "coaster", thrill: 3, note: "Drop-tower launch" },
  { id: "ioa-hulk", park: "ioa", name: "The Incredible Hulk Coaster", land: "Marvel Super Hero Island", minHeight: 54, kind: "coaster", thrill: 3, note: "Tallest requirement at Universal" },

  // ── Universal Epic Universe ────────────────────────────────────────────────
  { id: "epic-carousel", park: "epic", name: "Constellation Carousel", land: "Celestial Park", minHeight: null, kind: "kiddie", thrill: 1, note: "Gorgeous at night" },
  { id: "epic-fyre", park: "epic", name: "Fyre Drill", land: "Isle of Berk", minHeight: null, kind: "water", thrill: 1, note: "Water-blaster boat ride — everyone gets wet" },
  { id: "epic-yoshi", park: "epic", name: "Yoshi's Adventure", land: "Super Nintendo World", minHeight: 34, kind: "kiddie", thrill: 1, note: "Slow egg-hunt ride above Nintendo World" },
  { id: "epic-werewolf", park: "epic", name: "Curse of the Werewolf", land: "Dark Universe", minHeight: 40, kind: "coaster", thrill: 2, note: "Spinning family coaster — spooky theme" },
  { id: "epic-ministry", park: "epic", name: "Harry Potter: Battle at the Ministry", land: "Wizarding World — Ministry of Magic", minHeight: 40, kind: "dark", thrill: 2, note: "The headliner dark ride — get in the virtual line early" },
  { id: "epic-hiccup", park: "epic", name: "Hiccup's Wing Gliders", land: "Isle of Berk", minHeight: 40, kind: "coaster", thrill: 2, note: "Family launch coaster — great first 'big' coaster" },
  { id: "epic-mariokart", park: "epic", name: "Mario Kart: Bowser's Challenge", land: "Super Nintendo World", minHeight: 40, kind: "dark", thrill: 2, note: "AR headset kart ride" },
  { id: "epic-minecart", park: "epic", name: "Mine-Cart Madness", land: "Super Nintendo World — Donkey Kong Country", minHeight: 40, kind: "coaster", thrill: 2, note: "Boom-blast 'jumping' mine carts" },
  { id: "epic-dragonracer", park: "epic", name: "Dragon Racer's Rally", land: "Isle of Berk", minHeight: 48, kind: "family", thrill: 2, note: "Sky-fly gliders you flip yourself — as wild as you make it" },
  { id: "epic-monsters", park: "epic", name: "Monsters Unchained: The Frankenstein Experiment", land: "Dark Universe", minHeight: 48, kind: "dark", thrill: 3, note: "Intense and genuinely scary — 10+ territory" },
  { id: "epic-stardust", park: "epic", name: "Stardust Racers", land: "Celestial Park", minHeight: 48, kind: "coaster", thrill: 3, note: "Dual racing launch coaster — the park's big one" },

  // ── Magic Kingdom ──────────────────────────────────────────────────────────
  { id: "mk-peoplemover", park: "mk", name: "PeopleMover", land: "Tomorrowland", minHeight: null, kind: "family", thrill: 1, note: "Everyone's favorite break ride" },
  { id: "mk-buzz", park: "mk", name: "Buzz Lightyear's Space Ranger Spin", land: "Tomorrowland", minHeight: null, kind: "dark", thrill: 1, note: "Laser-blaster competition" },
  { id: "mk-pirates", park: "mk", name: "Pirates of the Caribbean", land: "Adventureland", minHeight: null, kind: "dark", thrill: 1, note: "One small drop in the dark" },
  { id: "mk-jungle", park: "mk", name: "Jungle Cruise", land: "Adventureland", minHeight: null, kind: "family", thrill: 1 },
  { id: "mk-mansion", park: "mk", name: "Haunted Mansion", land: "Liberty Square", minHeight: null, kind: "dark", thrill: 1, note: "Spooky-silly, not scary — but know your 4yo" },
  { id: "mk-smallworld", park: "mk", name: "it's a small world", land: "Fantasyland", minHeight: null, kind: "family", thrill: 1 },
  { id: "mk-peterpan", park: "mk", name: "Peter Pan's Flight", land: "Fantasyland", minHeight: null, kind: "dark", thrill: 1, note: "Line gets long — go early" },
  { id: "mk-mermaid", park: "mk", name: "Under the Sea — Little Mermaid", land: "Fantasyland", minHeight: null, kind: "dark", thrill: 1 },
  { id: "mk-dumbo", park: "mk", name: "Dumbo the Flying Elephant", land: "Fantasyland", minHeight: null, kind: "kiddie", thrill: 1 },
  { id: "mk-teacups", park: "mk", name: "Mad Tea Party", land: "Fantasyland", minHeight: null, kind: "kiddie", thrill: 1 },
  { id: "mk-speedway", park: "mk", name: "Tomorrowland Speedway", land: "Tomorrowland", minHeight: 32, kind: "family", thrill: 1, note: "32″ to ride along; 54″ to drive alone" },
  { id: "mk-barnstormer", park: "mk", name: "The Barnstormer", land: "Fantasyland", minHeight: 35, kind: "kiddie", thrill: 1, note: "Starter coaster for the littles" },
  { id: "mk-bigthunder", park: "mk", name: "Big Thunder Mountain Railroad", land: "Frontierland", minHeight: 38, kind: "coaster", thrill: 2, note: "Reopened May 2026 with the bar LOWERED to 38″ (was 40″)" },
  { id: "mk-sevendwarfs", park: "mk", name: "Seven Dwarfs Mine Train", land: "Fantasyland", minHeight: 38, kind: "coaster", thrill: 2, note: "Smooth family coaster — the whole 38″+ crowd loves it" },
  { id: "mk-tiana", park: "mk", name: "Tiana's Bayou Adventure", land: "Frontierland", minHeight: 40, kind: "water", thrill: 2, note: "Log flume with the big 50-ft drop" },
  { id: "mk-space", park: "mk", name: "Space Mountain", land: "Tomorrowland", minHeight: 44, kind: "coaster", thrill: 3, note: "Coaster in the dark" },
  { id: "mk-tron", park: "mk", name: "TRON Lightcycle / Run", land: "Tomorrowland", minHeight: 48, kind: "coaster", thrill: 3, note: "Motorbike-style launch coaster — the 10+ headliner" },

  // ── Epcot ──────────────────────────────────────────────────────────────────
  { id: "epcot-spaceship", park: "epcot", name: "Spaceship Earth", land: "World Celebration", minHeight: null, kind: "dark", thrill: 1, note: "The golf ball" },
  { id: "epcot-frozen", park: "epcot", name: "Frozen Ever After", land: "World Showcase — Norway", minHeight: null, kind: "dark", thrill: 1, note: "Small backwards drop; huge with the 4–9s" },
  { id: "epcot-remy", park: "epcot", name: "Remy's Ratatouille Adventure", land: "World Showcase — France", minHeight: null, kind: "dark", thrill: 1, note: "Shrink to rat size — trackless and sweet" },
  { id: "epcot-nemo", park: "epcot", name: "The Seas with Nemo & Friends", land: "World Nature", minHeight: null, kind: "dark", thrill: 1, note: "Real aquarium at the exit" },
  { id: "epcot-land", park: "epcot", name: "Living with the Land", land: "World Nature", minHeight: null, kind: "family", thrill: 1, note: "Boat through real greenhouses" },
  { id: "epcot-fiesta", park: "epcot", name: "Gran Fiesta Tour", land: "World Showcase — Mexico", minHeight: null, kind: "family", thrill: 1, note: "Boat ride inside the pyramid" },
  { id: "epcot-soarin", park: "epcot", name: "Soarin'", land: "World Nature", minHeight: 40, kind: "family", thrill: 1, note: "Hang-glider theater — gentle but you're up high" },
  { id: "epcot-testtrack", park: "epcot", name: "Test Track", land: "World Discovery", minHeight: 40, kind: "family", thrill: 2, note: "65 mph outdoor sprint finale" },
  { id: "epcot-missionspace", park: "epcot", name: "Mission: SPACE", land: "World Discovery", minHeight: 40, kind: "dark", thrill: 3, note: "Green (gentler) side 40″; spinning Orange side is 44″ and NOT for queasy stomachs" },
  { id: "epcot-guardians", park: "epcot", name: "Guardians of the Galaxy: Cosmic Rewind", land: "World Discovery", minHeight: 42, kind: "coaster", thrill: 3, note: "Indoor spinning launch coaster — the Epcot headliner" },

  // ── Disney's Hollywood Studios ─────────────────────────────────────────────
  { id: "hs-toystorymania", park: "hs", name: "Toy Story Mania!", land: "Toy Story Land", minHeight: null, kind: "dark", thrill: 1, note: "4-player carnival-game shootout" },
  { id: "hs-runaway", park: "hs", name: "Mickey & Minnie's Runaway Railway", land: "Hollywood Boulevard", minHeight: null, kind: "dark", thrill: 1, note: "Trackless cartoon romp — all ages" },
  { id: "hs-saucers", park: "hs", name: "Alien Swirling Saucers", land: "Toy Story Land", minHeight: 32, kind: "kiddie", thrill: 1 },
  { id: "hs-slinky", park: "hs", name: "Slinky Dog Dash", land: "Toy Story Land", minHeight: 38, kind: "coaster", thrill: 2, note: "The perfect first family coaster — book it early" },
  { id: "hs-falcon", park: "hs", name: "Millennium Falcon: Smugglers Run", land: "Galaxy's Edge", minHeight: 38, kind: "dark", thrill: 2, note: "You fly the Falcon — 6 crew roles" },
  { id: "hs-startours", park: "hs", name: "Star Tours: The Adventures Continue", land: "Echo Lake", minHeight: 40, kind: "dark", thrill: 2, note: "Motion simulator" },
  { id: "hs-rise", park: "hs", name: "Star Wars: Rise of the Resistance", land: "Galaxy's Edge", minHeight: 40, kind: "dark", thrill: 2, note: "The most ambitious ride at Disney — do not skip" },
  { id: "hs-tower", park: "hs", name: "The Twilight Zone Tower of Terror", land: "Sunset Boulevard", minHeight: 40, kind: "dark", thrill: 3, note: "Random-sequence elevator drops" },
  { id: "hs-rnrc", park: "hs", name: "Rock 'n' Roller Coaster Starring The Muppets", land: "Sunset Boulevard", minHeight: 48, kind: "coaster", thrill: 3, note: "0–57 mph launch, inversions — freshly Muppets-rethemed" },

  // ── Disney's Animal Kingdom ────────────────────────────────────────────────
  { id: "ak-safaris", park: "ak", name: "Kilimanjaro Safaris", land: "Africa", minHeight: null, kind: "family", thrill: 1, note: "Real animals — best first thing in the morning" },
  { id: "ak-navi", park: "ak", name: "Na'vi River Journey", land: "Pandora", minHeight: null, kind: "dark", thrill: 1, note: "Glowing boat float — all ages" },
  { id: "ak-triceratop", park: "ak", name: "TriceraTop Spin", land: "Dinoland U.S.A.", minHeight: null, kind: "kiddie", thrill: 1, note: "DINOSAUR next door is closed for the Tropical Americas retheme" },
  { id: "ak-kali", park: "ak", name: "Kali River Rapids", land: "Asia", minHeight: 38, kind: "water", thrill: 2, note: "Raft ride — someone's getting soaked" },
  { id: "ak-everest", park: "ak", name: "Expedition Everest", land: "Asia", minHeight: 44, kind: "coaster", thrill: 3, note: "Backwards through the mountain — Yeti inside" },
  { id: "ak-fop", park: "ak", name: "Avatar Flight of Passage", land: "Pandora", minHeight: 44, kind: "dark", thrill: 3, note: "Ride a banshee — the best ride at Disney, book first" },

  // ── LEGOLAND Florida ───────────────────────────────────────────────────────
  { id: "lego-ninjago", park: "lego", name: "LEGO NINJAGO The Ride", land: "NINJAGO World", minHeight: null, kind: "dark", thrill: 1, note: "Hand-gesture blasting — no controllers" },
  { id: "lego-pirateriver", park: "lego", name: "Pirate River Quest", land: "Pirate Shores", minHeight: null, kind: "family", thrill: 1, note: "Boat quest through the old gardens" },
  { id: "lego-carousel", park: "lego", name: "The Grand Carousel", land: "Fun Town", minHeight: null, kind: "kiddie", thrill: 1 },
  { id: "lego-bricksburg", park: "lego", name: "Battle of Bricksburg", land: "LEGO Movie World", minHeight: null, kind: "water", thrill: 1, note: "Water-cannon battle — riders and bystanders both get wet" },
  { id: "lego-duplotrain", park: "lego", name: "DUPLO Train", land: "DUPLO Valley", minHeight: null, kind: "kiddie", thrill: 1, note: "For the very smallest crew members" },
  { id: "lego-drivingschool", park: "lego", name: "Driving School", land: "LEGO City", minHeight: null, kind: "family", thrill: 1, note: "Real 'license' course — ages 6–13 drive; Junior version for 3–5" },
  { id: "lego-lostkingdom", park: "lego", name: "Lost Kingdom Adventure", land: "Land of Adventure", minHeight: 30, kind: "dark", thrill: 1, note: "Laser-blaster dark ride" },
  { id: "lego-kidpower", park: "lego", name: "Kid Power Towers", land: "Fun Town", minHeight: 30, kind: "family", thrill: 1, note: "Pull yourself up, 'free-fall' down — sources disagree on the bar (30–44″), check at the ride" },
  { id: "lego-safari", park: "lego", name: "Safari Trek", land: "DUPLO Valley", minHeight: 34, kind: "kiddie", thrill: 1, note: "LEGO animal safari" },
  { id: "lego-coastguard", park: "lego", name: "Coast Guard Academy", land: "LEGO City", minHeight: 34, kind: "family", thrill: 1, note: "Drive your own boat" },
  { id: "lego-rescue", park: "lego", name: "NFPA Rescue Academy", land: "LEGO City", minHeight: 34, kind: "family", thrill: 1, note: "Team fire-truck race — everyone pumps" },
  { id: "lego-beetlebounce", park: "lego", name: "Beetle Bounce", land: "Land of Adventure", minHeight: 36, kind: "kiddie", thrill: 1, note: "Mini drop tower" },
  { id: "lego-merlin", park: "lego", name: "Merlin's Challenge", land: "LEGO Kingdoms", minHeight: 36, kind: "kiddie", thrill: 1, note: "Spinning carnival train" },
  { id: "lego-joust", park: "lego", name: "Royal Joust", land: "LEGO Kingdoms", minHeight: 36, kind: "kiddie", thrill: 1, note: "Kids-only LEGO horse ride" },
  { id: "lego-technicycle", park: "lego", name: "Technicycle", land: "LEGO Technic", minHeight: 36, kind: "kiddie", thrill: 1, note: "Pedal-powered spinner" },
  { id: "lego-dragon", park: "lego", name: "The Dragon", land: "LEGO Kingdoms", minHeight: 40, kind: "coaster", thrill: 2, note: "Indoor/outdoor family coaster through the castle" },
  { id: "lego-mastersofflight", park: "lego", name: "THE LEGO MOVIE Masters of Flight", land: "LEGO Movie World", minHeight: 40, kind: "family", thrill: 1, note: "Soarin'-style flying theater on Emmet's couch" },
  { id: "lego-unikitty", park: "lego", name: "Unikitty's Disco Drop", land: "LEGO Movie World", minHeight: 40, kind: "kiddie", thrill: 1, note: "Mini tower with a spin" },
  { id: "lego-aquazone", park: "lego", name: "AQUAZONE Wave Racers", land: "LEGO Technic", minHeight: 40, kind: "water", thrill: 2, note: "Dodge the water blasts" },
  { id: "lego-coastersaurus", park: "lego", name: "Coastersaurus", land: "Dino Valley", minHeight: 42, kind: "coaster", thrill: 2, note: "Classic wooden coaster, freshly rebuilt 2026" },
  { id: "lego-greatrace", park: "lego", name: "The Great LEGO Race", land: "LEGO Technic", minHeight: 42, kind: "coaster", thrill: 2, note: "The park's wildest coaster" },
  { id: "lego-galacticoaster", park: "lego", name: "Galacticoaster", land: "LEGO City Space", minHeight: 42, kind: "coaster", thrill: 2, note: "NEW for 2026 — indoor space coaster" },
  { id: "lego-mia", park: "lego", name: "Mia's Riding Adventure", land: "Heartlake City", minHeight: 48, kind: "family", thrill: 2, note: "Spinning horse disc coaster — tallest bar in the park" },

  // ── SeaWorld Orlando ───────────────────────────────────────────────────────
  { id: "sw-skytower", park: "sw", name: "Sky Tower", land: "Port of Entry", minHeight: null, kind: "family", thrill: 1, note: "400-ft rotating observation ride" },
  { id: "sw-carousel", park: "sw", name: "Sunny Day Carousel", land: "Sesame Street Land", minHeight: null, kind: "kiddie", thrill: 1 },
  { id: "sw-paddleboats", park: "sw", name: "Flamingo Paddle Boats", land: "Lagoon", minHeight: null, kind: "family", thrill: 1, note: "Rent-a-flamingo across the lagoon" },
  { id: "sw-flowertower", park: "sw", name: "Abby's Flower Tower", land: "Sesame Street Land", minHeight: null, kind: "kiddie", thrill: 1 },
  { id: "sw-elmo", park: "sw", name: "Elmo's Choo Choo Train", land: "Sesame Street Land", minHeight: 36, kind: "kiddie", thrill: 1 },
  { id: "sw-grover", park: "sw", name: "Super Grover's Box Car Derby", land: "Sesame Street Land", minHeight: 38, kind: "kiddie", thrill: 1, note: "The littles' first coaster" },
  { id: "sw-expedition", park: "sw", name: "Expedition Odyssey: Fire & Ice", land: "Arctic", minHeight: 39, kind: "family", thrill: 1, note: "New flying-theater ride to the Arctic; real belugas after" },
  { id: "sw-atlantis", park: "sw", name: "Journey to Atlantis", land: "Sea of Legends", minHeight: 42, kind: "water", thrill: 2, note: "Flume coaster with a big splashdown" },
  { id: "sw-infinityfalls", park: "sw", name: "Infinity Falls", land: "Rainforest", minHeight: 42, kind: "water", thrill: 2, note: "Rapids with a 40-ft drop — fully soaked" },
  { id: "sw-penguintrek", park: "sw", name: "Penguin Trek", land: "Antarctica", minHeight: 42, kind: "coaster", thrill: 2, note: "Family snowmobile coaster — ends inside the real penguin habitat" },
  { id: "sw-icebreaker", park: "sw", name: "Ice Breaker", land: "Arctic", minHeight: 48, kind: "coaster", thrill: 3, note: "Backwards-forwards launches" },
  { id: "sw-mako", park: "sw", name: "Mako", land: "Sea of Legends", minHeight: 54, kind: "coaster", thrill: 3, note: "Orlando's tallest, fastest hypercoaster" },
  { id: "sw-kraken", park: "sw", name: "Kraken", land: "Sea of Legends", minHeight: 54, kind: "coaster", thrill: 3, note: "Floorless, 7 inversions" },
  { id: "sw-manta", park: "sw", name: "Manta", land: "Port of Entry", minHeight: 54, kind: "coaster", thrill: 3, note: "Face-down flying coaster" },
  { id: "sw-pipeline", park: "sw", name: "Pipeline: The Surf Coaster", land: "Waterfront", minHeight: 54, kind: "coaster", thrill: 3, note: "Stand-up 'surfing' coaster" },
];
