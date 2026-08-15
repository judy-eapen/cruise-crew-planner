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
  departTime: string; // e.g. "Sat 7:05am nonstop"
  returnTime: string; // e.g. "Sun 8:40pm 1 stop"
  farePerPerson: number; // round trip; kids 2+ pay the same fare as adults
  bagFee: number; // round trip, per checked bag ($0 = bags included)
  estimate: boolean;
  priceChecked: string;
}

export type HotelPriceMode = "per_room_night" | "per_property_night_split";

export interface Hotel {
  id: string;
  name: string;
  price: number; // per night — per room, or for the whole property (split across families)
  priceMode: HotelPriceMode;
  stars: number;
  area: string; // e.g. "Lake Buena Vista", "Cocoa Beach / near port"
  type: "hotel" | "airbnb";
  pool: boolean;
  breakfastIncluded: boolean;
  amenities: string;
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
