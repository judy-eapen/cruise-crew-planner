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

export interface Flight {
  optionId: OptionId;
  origin: Origin;
  airline: string; // e.g. "Frontier", "United" — multiple fares per option+origin
  farePerPerson: number; // round trip; kids 2+ pay the same fare as adults
  estimate: boolean;
  priceChecked: string;
}

export interface Hotel {
  id: string;
  name: string;
  nightlyRate: number;
  breakfastIncluded: boolean;
  estimate: boolean;
}

export interface Activity {
  id: string;
  name: string;
  type: "full" | "half";
  adultPrice: number; // adults AND kids 10+ pay this
  childPrice: number; // ages 3–9
  category: string;
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
  activityId: string | null;
}

export interface Family {
  id: string;
  name: string;
  adults: number;
  kids39: number; // ages 3–9 → child ticket pricing
  kids10plus: number; // pay adult ticket prices
  rooms: number;
  placeholder: boolean;
}

export interface TripData {
  source: "seed" | "db";
  dateOptions: DateOption[];
  flights: Flight[];
  hotels: Hotel[];
  activities: Activity[];
  slots: ItinerarySlot[];
  families: Family[];
}

export interface VoteRecord {
  familyId: string;
  familyName: string;
  firstChoice: OptionId;
  secondChoice: OptionId | null;
  comment: string | null;
  updatedAt: string;
}
