// Ride height requirements — verified 2026-08-17 against Universal's official
// "Guide for Rider Safety and Accessibility" (universalorlando.com PDF,
// effective Aug 6 2026). Rip Ride Rockit and Fast & Furious Supercharged are
// closed (absent from the guide). Heights in inches; minHeight null = any height.

export type ParkId = "usf" | "ioa" | "epic" | "mk" | "lego";

export interface Park {
  id: ParkId;
  name: string;
  short: string;
  emoji: string;
  available: boolean; // false = data not loaded yet, chip shows "soon"
  note?: string;
}

export const PARKS: Park[] = [
  { id: "usf", name: "Universal Studios Florida", short: "Universal Studios", emoji: "🎬", available: true },
  { id: "ioa", name: "Islands of Adventure", short: "Islands of Adventure", emoji: "🦖", available: true },
  { id: "epic", name: "Universal Epic Universe", short: "Epic Universe", emoji: "🌌", available: false },
  { id: "mk", name: "Magic Kingdom", short: "Magic Kingdom", emoji: "🏰", available: false },
  { id: "lego", name: "LEGOLAND Florida", short: "Legoland", emoji: "🧱", available: false },
];

// Trip activities (data/trip.ts + DB ids) that are theme parks with ride data.
export const ACTIVITY_PARK: Record<string, ParkId> = {
  US: "usf",
  IOA: "ioa",
  EPIC: "epic",
  MK: "mk",
  LEGO: "lego",
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
  { id: "ioa-hulk", park: "ioa", name: "The Incredible Hulk Coaster", land: "Marvel Super Hero Island", minHeight: 54, kind: "coaster", thrill: 3, note: "Tallest requirement in either park" },
];
