// Seed trip data — ported from the planning CSVs (2026-08-14).
// Prices marked estimate:true are placeholders pending real research.
// Used directly until Supabase is connected; also the payload for the
// admin "seed database" action.

import type {
  Activity,
  DateOption,
  Family,
  Flight,
  Hotel,
  ItinerarySlot,
  OptionId,
  Origin,
  TripData,
} from "@/lib/types";

export const CRUISE = {
  boardDate: "2026-11-02",
  boardLabel: "Mon Nov 2 (board PM)",
  disembarkDate: "2026-11-06",
  disembarkLabel: "Fri Nov 6 (off 9am)",
};

const DATE_OPTIONS: DateOption[] = [
  { id: "A", label: "Sat out / Sun back — max Orlando", departDate: "2026-10-31", returnDate: "2026-11-08", preNights: 2, postNights: 2, hotelNights: 4 },
  { id: "B", label: "Sat out / Sat back", departDate: "2026-10-31", returnDate: "2026-11-07", preNights: 2, postNights: 1, hotelNights: 3 },
  { id: "C", label: "Sat out / fly home off the ship", departDate: "2026-10-31", returnDate: "2026-11-06", preNights: 2, postNights: 0, hotelNights: 2 },
  { id: "D", label: "Sun out / Sun back", departDate: "2026-11-01", returnDate: "2026-11-08", preNights: 1, postNights: 2, hotelNights: 3 },
  { id: "E", label: "Sun out / Sat back", departDate: "2026-11-01", returnDate: "2026-11-07", preNights: 1, postNights: 1, hotelNights: 2 },
  { id: "F", label: "Sun out / fly home off the ship — minimum trip", departDate: "2026-11-01", returnDate: "2026-11-06", preNights: 1, postNights: 0, hotelNights: 1 },
];

const FARES: Record<OptionId, Record<Origin, number>> = {
  A: { IAD: 242, DCA: 258, BWI: 218 },
  B: { IAD: 232, DCA: 248, BWI: 208 },
  C: { IAD: 252, DCA: 268, BWI: 228 },
  D: { IAD: 222, DCA: 238, BWI: 198 },
  E: { IAD: 212, DCA: 228, BWI: 188 },
  F: { IAD: 236, DCA: 252, BWI: 208 },
};

export const PRICE_CHECKED = "2026-08-14";

const FLIGHTS: Flight[] = (Object.keys(FARES) as OptionId[]).flatMap((optionId) =>
  (["IAD", "DCA", "BWI"] as Origin[]).map((origin) => ({
    optionId,
    origin,
    farePerPerson: FARES[optionId][origin],
    estimate: true,
    priceChecked: PRICE_CHECKED,
  }))
);

const HOTELS: Hotel[] = [
  { id: "H1", name: "Value — Drury Inn Lake Buena Vista", nightlyRate: 145, breakfastIncluded: true, estimate: true },
  { id: "H2", name: "Mid — Residence Inn Flamingo Crossings (suites)", nightlyRate: 185, breakfastIncluded: true, estimate: true },
  { id: "H3", name: "Splurge — Disney on-property (Pop Century)", nightlyRate: 260, breakfastIncluded: false, estimate: true },
];

const ACTIVITIES: Activity[] = [
  { id: "MK", name: "Magic Kingdom", type: "full", adultPrice: 175, childPrice: 165, category: "Theme park", star: true, estimate: true, note: "Great fit for the whole group, esp. the younger half" },
  { id: "AK", name: "Animal Kingdom", type: "full", adultPrice: 145, childPrice: 135, category: "Theme park", star: true, estimate: true, note: "All ages love the safari" },
  { id: "HS", name: "Hollywood Studios", type: "full", adultPrice: 160, childPrice: 150, category: "Theme park", star: true, estimate: true, note: "Star Wars / Toy Story spans the whole age range" },
  { id: "SW", name: "SeaWorld Orlando", type: "full", adultPrice: 80, childPrice: 75, category: "Theme park", star: true, estimate: true, note: "Animal exhibits work for all ages incl. the 4yo" },
  { id: "LEGO", name: "LEGOLAND Florida", type: "full", adultPrice: 105, childPrice: 95, category: "Theme park", star: true, estimate: true, note: "Especially good for the 4–10yos" },
  { id: "GATOR", name: "Gatorland", type: "full", adultPrice: 35, childPrice: 25, category: "Attraction", star: true, estimate: true, note: "Budget-friendly full day, fits everyone" },
  { id: "OSC", name: "Orlando Science Center", type: "half", adultPrice: 26, childPrice: 21, category: "Attraction", star: true, estimate: true, note: "Hands-on for literally every kid age in the group" },
  { id: "FUNSPOT", name: "Fun Spot America", type: "half", adultPrice: 60, childPrice: 50, category: "Attraction", star: true, estimate: true, note: "Kiddie rides AND bigger coasters" },
  { id: "ICON", name: "ICON Park + The Wheel", type: "half", adultPrice: 35, childPrice: 28, category: "Attraction", star: true, estimate: true, note: "Arcade + wheel + mini golf" },
  { id: "CRAYOLA", name: "Crayola Experience", type: "half", adultPrice: 30, childPrice: 30, category: "Attraction", star: true, estimate: true, note: "Especially good for the 4–8yos" },
  { id: "WW", name: "WonderWorks", type: "half", adultPrice: 40, childPrice: 30, category: "Attraction", star: true, estimate: true, note: "Whole age range" },
  { id: "AIRBOAT", name: "Airboat tour", type: "half", adultPrice: 60, childPrice: 45, category: "Attraction", star: true, estimate: true, note: "All ages" },
  { id: "DS", name: "Disney Springs", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", star: true, estimate: false, note: "Easy to split into smaller groups by age" },
  { id: "CW", name: "CityWalk at Universal", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", star: true, estimate: false },
  { id: "WPBOAT", name: "Winter Park Scenic Boat Tour", type: "half", adultPrice: 18, childPrice: 9, category: "Free / low cost", star: true, estimate: true, note: "Relaxing for the whole mixed group" },
  { id: "POOL", name: "Hotel pool time", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", star: true, estimate: false, note: "Universal win with 14 kids" },
  { id: "COCOA", name: "Cocoa Beach", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", star: true, estimate: false },
  { id: "BEACH", name: "Beach day (Cocoa Beach / New Smyrna)", type: "full", adultPrice: 0, childPrice: 0, category: "Free / low cost", star: true, estimate: false },
];

const ITINERARY_SLOTS: ItinerarySlot[] = [
  { optionId: "A", date: "2026-10-31", dayLabel: "Sat — arrive", slotType: "half", activityId: "DS" },
  { optionId: "A", date: "2026-11-01", dayLabel: "Sun", slotType: "full", activityId: "MK" },
  { optionId: "A", date: "2026-11-02", dayLabel: "Mon — board ship PM", slotType: "travel", activityId: null },
  { optionId: "A", date: "2026-11-06", dayLabel: "Fri — off ship 9am", slotType: "full", activityId: "AK" },
  { optionId: "A", date: "2026-11-07", dayLabel: "Sat", slotType: "full", activityId: "HS" },
  { optionId: "A", date: "2026-11-08", dayLabel: "Sun — fly home", slotType: "half", activityId: "POOL" },
  { optionId: "B", date: "2026-10-31", dayLabel: "Sat — arrive", slotType: "half", activityId: "DS" },
  { optionId: "B", date: "2026-11-01", dayLabel: "Sun", slotType: "full", activityId: "MK" },
  { optionId: "B", date: "2026-11-02", dayLabel: "Mon — board ship PM", slotType: "travel", activityId: null },
  { optionId: "B", date: "2026-11-06", dayLabel: "Fri — off ship 9am", slotType: "full", activityId: "AK" },
  { optionId: "B", date: "2026-11-07", dayLabel: "Sat — fly home", slotType: "half", activityId: "POOL" },
  { optionId: "C", date: "2026-10-31", dayLabel: "Sat — arrive", slotType: "half", activityId: "DS" },
  { optionId: "C", date: "2026-11-01", dayLabel: "Sun", slotType: "full", activityId: "MK" },
  { optionId: "C", date: "2026-11-02", dayLabel: "Mon — board ship PM", slotType: "travel", activityId: null },
  { optionId: "C", date: "2026-11-06", dayLabel: "Fri — off ship, fly home", slotType: "travel", activityId: null },
  { optionId: "D", date: "2026-11-01", dayLabel: "Sun — arrive", slotType: "half", activityId: "DS" },
  { optionId: "D", date: "2026-11-02", dayLabel: "Mon — board ship PM", slotType: "travel", activityId: null },
  { optionId: "D", date: "2026-11-06", dayLabel: "Fri — off ship 9am", slotType: "full", activityId: "AK" },
  { optionId: "D", date: "2026-11-07", dayLabel: "Sat", slotType: "full", activityId: "MK" },
  { optionId: "D", date: "2026-11-08", dayLabel: "Sun — fly home", slotType: "half", activityId: "POOL" },
  { optionId: "E", date: "2026-11-01", dayLabel: "Sun — arrive", slotType: "half", activityId: "DS" },
  { optionId: "E", date: "2026-11-02", dayLabel: "Mon — board ship PM", slotType: "travel", activityId: null },
  { optionId: "E", date: "2026-11-06", dayLabel: "Fri — off ship 9am", slotType: "full", activityId: "MK" },
  { optionId: "E", date: "2026-11-07", dayLabel: "Sat — fly home", slotType: "half", activityId: "POOL" },
  { optionId: "F", date: "2026-11-01", dayLabel: "Sun — arrive", slotType: "half", activityId: "DS" },
  { optionId: "F", date: "2026-11-02", dayLabel: "Mon — board ship PM", slotType: "travel", activityId: null },
  { optionId: "F", date: "2026-11-06", dayLabel: "Fri — off ship, fly home", slotType: "travel", activityId: null },
];

const FAMILIES: Family[] = [
  { id: "F1", name: "Family 1", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, placeholder: true },
  { id: "F2", name: "Family 2", adults: 2, kids39: 2, kids10plus: 1, rooms: 1, placeholder: true },
  { id: "F3", name: "Family 3", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, placeholder: true },
  { id: "F4", name: "Family 4", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, placeholder: true },
  { id: "F5", name: "Family 5", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, placeholder: true },
  { id: "F6", name: "Family 6", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, placeholder: true },
  { id: "F7", name: "Family 7", adults: 2, kids39: 0, kids10plus: 1, rooms: 1, placeholder: true },
];

export const SEED: TripData = {
  source: "seed",
  dateOptions: DATE_OPTIONS,
  flights: FLIGHTS,
  hotels: HOTELS,
  activities: ACTIVITIES,
  slots: ITINERARY_SLOTS,
  families: FAMILIES,
};
