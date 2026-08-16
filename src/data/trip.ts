// Seed trip data — placeholder prices flagged estimate:true, replaced from /admin.
// Used directly until Supabase is connected; also the payload for the
// admin "seed database" action.

import type {
  Activity,
  DateOption,
  Family,
  FlightQuote,
  Hotel,
  ItinerarySlot,
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

export const PRICE_CHECKED = "2026-08-14";

// Placeholder quotes (one per airport per option) until real "cheapest 3" research lands.
const SEED_FARES: Record<string, { IAD: number; DCA: number; BWI: number }> = {
  A: { IAD: 242, DCA: 258, BWI: 218 },
  B: { IAD: 232, DCA: 248, BWI: 208 },
  C: { IAD: 252, DCA: 268, BWI: 228 },
  D: { IAD: 222, DCA: 238, BWI: 198 },
  E: { IAD: 212, DCA: 228, BWI: 188 },
  F: { IAD: 236, DCA: 252, BWI: 208 },
};

let quoteId = 0;
const FLIGHTS: FlightQuote[] = DATE_OPTIONS.flatMap((o) =>
  (["BWI", "IAD", "DCA"] as const).map((origin) => ({
    id: ++quoteId,
    optionId: o.id,
    origin,
    airline: "TBD",
    outDepart: "TBD",
    outArrive: "TBD",
    retDepart: "TBD",
    retArrive: "TBD",
    duration: "~2h 15m",
    farePerPerson: SEED_FARES[o.id][origin],
    bagFee: 50, // assumption: $50 per checked bag round trip until a real quote says otherwise
    estimate: true,
    priceChecked: PRICE_CHECKED,
  }))
);

const HOTELS: Hotel[] = [
  { id: "H1", name: "Drury Inn Lake Buena Vista", stayPre2: 290, stayPre1: 145, stayPost2: 290, stayPost1: 145, priceMode: "per_room_night", stars: 3, area: "Lake Buena Vista (near Disney)", type: "hotel", pool: true, breakfastIncluded: true, amenities: "Free hot breakfast + evening snacks", link: "", sharedFamilies: 7, bedrooms: 0, beds: 0, baths: 0, sleeps: 0, cancellation: "", estimate: true },
  { id: "H2", name: "Residence Inn Flamingo Crossings (suites)", stayPre2: 370, stayPre1: 185, stayPost2: 370, stayPost1: 185, priceMode: "per_room_night", stars: 3, area: "Flamingo Crossings (near Disney)", type: "hotel", pool: true, breakfastIncluded: true, amenities: "Suites sleep 5–6, kitchenettes", link: "", sharedFamilies: 7, bedrooms: 0, beds: 0, baths: 0, sleeps: 0, cancellation: "", estimate: true },
  { id: "H3", name: "Disney Pop Century (on-property)", stayPre2: 520, stayPre1: 260, stayPost2: 520, stayPost1: 260, priceMode: "per_room_night", stars: 3, area: "Disney property", type: "hotel", pool: true, breakfastIncluded: false, amenities: "Early park entry", link: "", sharedFamilies: 7, bedrooms: 0, beds: 0, baths: 0, sleeps: 0, cancellation: "", estimate: true },
];

// Ticket links start empty in the seed — real URLs land via /admin or the v4 price-update SQL.
const ACTIVITY_ROWS: Omit<Activity, "ticketLink">[] = [
  { id: "MK", name: "Magic Kingdom", type: "full", adultPrice: 175, childPrice: 165, category: "Theme park", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Great fit for the whole group, esp. the younger half" },
  { id: "AK", name: "Animal Kingdom", type: "full", adultPrice: 145, childPrice: 135, category: "Theme park", ageFit: "all", area: "orlando", star: true, estimate: true, note: "All ages love the safari" },
  { id: "HS", name: "Hollywood Studios", type: "full", adultPrice: 160, childPrice: 150, category: "Theme park", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Star Wars / Toy Story spans the whole age range" },
  { id: "SW", name: "SeaWorld Orlando", type: "full", adultPrice: 80, childPrice: 75, category: "Theme park", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Animal exhibits work for all ages incl. the 4yo" },
  { id: "LEGO", name: "LEGOLAND Florida", type: "full", adultPrice: 105, childPrice: 95, category: "Theme park", ageFit: "younger", area: "daytrip", star: true, estimate: true, note: "Especially good for the 4–10yos; ~45 min drive" },
  { id: "GATOR", name: "Gatorland", type: "full", adultPrice: 35, childPrice: 25, category: "Attraction", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Budget-friendly full day, fits everyone" },
  { id: "KSC", name: "Kennedy Space Center", type: "half", adultPrice: 80, childPrice: 70, category: "Attraction", ageFit: "older", area: "port", star: false, estimate: true, note: "Near Port Canaveral — great on disembark day; best for 8+, hands-on exhibits help the littles" },
  { id: "OSC", name: "Orlando Science Center", type: "half", adultPrice: 26, childPrice: 21, category: "Attraction", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Hands-on for literally every kid age in the group" },
  { id: "CRAYOLA", name: "Crayola Experience", type: "half", adultPrice: 30, childPrice: 30, category: "Attraction", ageFit: "younger", area: "orlando", star: true, estimate: true, note: "Especially good for the 4–8yos" },
  { id: "WW", name: "WonderWorks", type: "half", adultPrice: 40, childPrice: 30, category: "Attraction", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Whole age range" },
  { id: "KART", name: "Andretti Indoor Karting", type: "half", adultPrice: 35, childPrice: 25, category: "Attraction", ageFit: "check", area: "orlando", star: false, estimate: true, note: "Go-kart height requirements may exclude the 4–5yos" },
  { id: "DS", name: "Disney Springs", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", ageFit: "all", area: "orlando", star: true, estimate: false, note: "Easy to split into smaller groups by age" },
  { id: "CW", name: "CityWalk at Universal", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", ageFit: "all", area: "orlando", star: true, estimate: false },
  { id: "WPBOAT", name: "Winter Park Scenic Boat Tour", type: "half", adultPrice: 18, childPrice: 9, category: "Free / low cost", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Relaxing for the whole mixed group" },
  { id: "POOL", name: "Hotel pool time", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", ageFit: "all", area: "orlando", star: true, estimate: false, note: "Universal win with 14 kids" },
  { id: "COCOA", name: "Cocoa Beach", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", ageFit: "all", area: "port", star: true, estimate: false, note: "~1 hr drive; pairs well with disembark day" },
  { id: "BEACH", name: "Beach day (Cocoa Beach / New Smyrna)", type: "full", adultPrice: 0, childPrice: 0, category: "Free / low cost", ageFit: "all", area: "daytrip", star: true, estimate: false },
  { id: "US", name: "Universal Studios", type: "full", adultPrice: 140, childPrice: 135, category: "Theme park", ageFit: "older", area: "orlando", star: false, estimate: true, note: "Harry Potter Diagon Alley; good for 8+, may be intense for the 4–6yos" },
  { id: "EPIC", name: "Universal Epic Universe", type: "full", adultPrice: 160, childPrice: 155, category: "Theme park", ageFit: "all", area: "orlando", star: false, estimate: true, note: "The new park — Super Nintendo World + Harry Potter Ministry of Magic; book early" },
  { id: "IOA", name: "Islands of Adventure", type: "full", adultPrice: 140, childPrice: 135, category: "Theme park", ageFit: "older", area: "orlando", star: false, estimate: true, note: "Harry Potter Hogsmeade + Hagrid coaster; best for the 10–13s" },
  { id: "EP", name: "Epcot", type: "full", adultPrice: 140, childPrice: 130, category: "Theme park", ageFit: "older", area: "orlando", star: false, estimate: true, note: "Good for 8+; the 4–6yos may get restless (less ride-heavy)" },
  { id: "DC", name: "Discovery Cove", type: "full", adultPrice: 220, childPrice: 220, category: "Attraction", ageFit: "check", area: "orlando", star: false, estimate: true, note: "All-inclusive; dolphin swim has age/height minimums — may exclude the 4yo" },
  { id: "EOLA", name: "Lake Eola Park", type: "half", adultPrice: 0, childPrice: 10, category: "Free / low cost", ageFit: "all", area: "orlando", star: true, estimate: true, note: "Swan boats; especially nice for the youngest kids" },
  { id: "PARKAVE", name: "Winter Park / Park Ave", type: "half", adultPrice: 0, childPrice: 0, category: "Free / low cost", ageFit: "all", area: "orlando", star: false, estimate: false, note: "More geared to parents; kids may get bored shopping" },
];
const ACTIVITIES: Activity[] = ACTIVITY_ROWS.map((a) => ({ ...a, ticketLink: "" }));

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
  { id: "F1", name: "Family 1", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, bags: 2, placeholder: true },
  { id: "F2", name: "Family 2", adults: 2, kids39: 2, kids10plus: 1, rooms: 1, bags: 2, placeholder: true },
  { id: "F3", name: "Family 3", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, bags: 2, placeholder: true },
  { id: "F4", name: "Family 4", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, bags: 2, placeholder: true },
  { id: "F5", name: "Family 5", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, bags: 2, placeholder: true },
  { id: "F6", name: "Family 6", adults: 2, kids39: 1, kids10plus: 1, rooms: 1, bags: 2, placeholder: true },
  { id: "F7", name: "Family 7", adults: 2, kids39: 0, kids10plus: 1, rooms: 1, bags: 2, placeholder: true },
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
