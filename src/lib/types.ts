export type OptionId = "A" | "B" | "C" | "D" | "E" | "F";
export type Origin = "IAD" | "DCA" | "BWI";

export interface DateOption {
  id: OptionId;
  label: string;
  departDate: string;
  returnDate: string;
  preNights: number;
  postNights: number;
  hotelNights: number;
}

/** A real, bookable flight quote (organizer enters ~3 per option, cheapest-first surfaced). */
export interface FlightQuote {
  id: number;
  optionId: OptionId;
  origin: Origin;
  airline: string;
  outDepart: string; // e.g. "7:05 AM"
  outArrive: string; // e.g. "9:45 AM"
  retDepart: string; // e.g. "6:10 PM"
  retArrive: string; // e.g. "8:40 PM"
  duration: string; // total flight time each way, e.g. "~2h 15m"
  farePerPerson: number; // round trip; kids 2+ pay the same fare as adults
  bagFee: number; // round trip, per checked bag ($0 = bags included)
  estimate: boolean;
  priceChecked: string;
}

export type HotelPriceMode = "per_room_night" | "per_property_night_split";

export interface Hotel {
  id: string;
  name: string;
  // The only four stays any option uses — each is the booked total for that stay
  // (per room, or for the whole property in split mode), capturing length-of-stay pricing.
  stayPre2: number; // Oct 31 → Nov 2 (2 nights)
  stayPre1: number; // Nov 1 → Nov 2 (1 night)
  stayPost2: number; // Nov 6 → Nov 8 (2 nights)
  stayPost1: number; // Nov 6 → Nov 7 (1 night)
  priceMode: HotelPriceMode;
  stars: number;
  area: string; // e.g. "Lake Buena Vista", "Cocoa Beach / near port"
  type: "hotel" | "airbnb";
  pool: boolean;
  breakfastIncluded: boolean;
  amenities: string;
  link: string; // booking-site URL — families can click through for photos/details
  sharedFamilies: number; // split-mode only: how many families share this property's cost
  bedrooms: number; // 0 = not stated (hotels can skip capacity fields)
  beds: number;
  baths: number;
  sleeps: number; // max occupancy
  cancellation: string; // e.g. "Free cancellation before Oct 26"
  estimate: boolean;
}

export type AgeFit = "all" | "younger" | "older" | "check";

export interface Activity {
  id: string;
  name: string;
  type: "full" | "half";
  adultPrice: number; // adults AND kids 10+ pay this
  childPrice: number; // ages 3–9
  category: string;
  ageFit: AgeFit; // all ages / best 3–9 / best 10+ / check height-age restrictions
  area: "orlando" | "port" | "daytrip";
  star: boolean;
  estimate: boolean;
  note?: string;
  ticketLink: string; // official ticket-purchase page URL ("" = none)
  /** Optional per-date prices (Disney-style calendar pricing). Key = ISO date; falls back to adultPrice/childPrice. */
  datePrices?: Record<string, { adult: number; child: number }>;
}

export type SlotType = "full" | "half" | "travel";

export interface ItinerarySlot {
  optionId: OptionId;
  date: string;
  dayLabel: string;
  slotType: SlotType;
  activityId: string | null; // the organizer's suggested activity (default build)
}

export interface Family {
  id: string;
  name: string;
  adults: number;
  kids39: number; // ages 3–9 → child ticket pricing
  kids10plus: number; // pay adult ticket prices
  rooms: number;
  bags: number; // checked bags for the flight
  placeholder: boolean;
}

export interface TripData {
  source: "seed" | "db";
  dateOptions: DateOption[];
  flights: FlightQuote[];
  hotels: Hotel[];
  activities: Activity[];
  slots: ItinerarySlot[];
  families: Family[];
}

/** One family's (or the organizer's default) configuration of an option. */
export interface Build {
  flightId: number | null; // null → cheapest quote
  preHotelId: string | null;
  postHotelId: string | null;
  activities: Record<string, string | null>; // date → activityId (free days only)
}

export interface VoteRecord {
  familyId: string;
  familyName: string;
  firstChoice: OptionId;
  secondChoice: OptionId | null;
  comment: string | null;
  updatedAt: string;
}
