// Server-only Supabase access. All reads/writes use the service-role key
// (never exposed to the browser); RLS denies the anonymous role entirely,
// so the API routes in src/app/api are the only doorway to the data.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SEED } from "@/data/trip";
import type {
  Activity,
  AgeFit,
  DateOption,
  Family,
  FlightQuote,
  Hotel,
  HotelPriceMode,
  ItinerarySlot,
  OptionId,
  Origin,
  SlotType,
  TripData,
} from "@/lib/types";

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapOption = (r: any): DateOption => ({
  id: r.id as OptionId,
  label: r.label,
  departDate: r.depart_date,
  returnDate: r.return_date,
  preNights: r.pre_nights,
  postNights: r.post_nights,
  hotelNights: r.hotel_nights,
});
const mapQuote = (r: any): FlightQuote => ({
  id: r.id,
  optionId: r.option_id as OptionId,
  origin: r.origin as Origin,
  airline: r.airline ?? "TBD",
  outDepart: r.out_depart ?? r.depart_time ?? "TBD",
  outArrive: r.out_arrive ?? "TBD",
  retDepart: r.ret_depart ?? r.return_time ?? "TBD",
  retArrive: r.ret_arrive ?? "TBD",
  duration: r.duration ?? "~2h 15m",
  farePerPerson: Number(r.fare_per_person),
  bagFee: Number(r.bag_fee ?? 0),
  estimate: r.estimate,
  priceChecked: r.price_checked,
  source: r.source === "api" ? "api" : "manual",
});
const mapHotel = (r: any): Hotel => ({
  id: r.id,
  name: r.name,
  stayPre2: Number(r.stay_pre2 ?? 0),
  stayPre1: Number(r.stay_pre1 ?? 0),
  stayPost2: Number(r.stay_post2 ?? 0),
  stayPost1: Number(r.stay_post1 ?? 0),
  priceMode: (r.price_mode ?? "per_room_night") as HotelPriceMode,
  stars: r.stars ?? 3,
  area: r.area ?? "",
  type: r.type === "airbnb" ? "airbnb" : "hotel",
  pool: r.pool ?? false,
  breakfastIncluded: r.breakfast_included ?? false,
  amenities: r.amenities ?? "",
  link: r.link ?? "",
  sharedFamilies: r.shared_families ?? 7,
  bedrooms: r.bedrooms ?? 0,
  beds: r.beds ?? 0,
  baths: Number(r.baths ?? 0),
  sleeps: r.sleeps ?? 0,
  cancellation: r.cancellation ?? "",
  estimate: r.estimate,
});
const mapActivity = (r: any): Activity => ({
  id: r.id,
  name: r.name,
  type: r.type,
  adultPrice: Number(r.adult_price),
  childPrice: Number(r.child_price),
  category: r.category,
  ageFit: (r.age_fit ?? "all") as AgeFit,
  area: r.area === "port" || r.area === "daytrip" ? r.area : "orlando",
  star: r.star,
  estimate: r.estimate,
  note: r.note ?? undefined,
  ticketLink: r.ticket_link ?? "",
  ageNotesYounger: r.age_notes_younger ?? "",
  ageNotesOlder: r.age_notes_older ?? "",
  datePrices: r.date_prices && typeof r.date_prices === "object" ? r.date_prices : undefined,
});
const mapSlot = (r: any): ItinerarySlot => ({
  optionId: r.option_id as OptionId,
  date: r.date,
  dayLabel: r.day_label,
  slotType: r.slot_type as SlotType,
  activityId: r.activity_id,
});
const mapFamily = (r: any): Family => ({
  id: r.id,
  name: r.name,
  adults: r.adults,
  kids39: r.kids_3_9,
  kids10plus: r.kids_10plus,
  rooms: r.rooms,
  bags: r.bags ?? 2,
  placeholder: r.placeholder,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

/** DB data when Supabase is configured AND seeded; otherwise the bundled seed. */
export async function getTripData(): Promise<TripData> {
  const supabase = getSupabase();
  if (!supabase) return SEED;

  const [opts, flights, hotels, activities, slots, families] = await Promise.all([
    supabase.from("date_options").select("*").order("id"),
    supabase.from("flights").select("*"),
    supabase.from("hotels").select("*").order("id"),
    supabase.from("activities").select("*"),
    supabase.from("itinerary_slots").select("*").order("date"),
    supabase.from("families").select("id,name,adults,kids_3_9,kids_10plus,rooms,bags,placeholder").order("id"),
  ]);

  // Not seeded yet (or schema missing) → keep serving the bundled seed.
  if (opts.error || !opts.data?.length) return SEED;

  return {
    source: "db",
    dateOptions: opts.data.map(mapOption),
    flights: (flights.data ?? []).map(mapQuote),
    // Airbnbs are hidden app-wide (group decided against them); rows stay in the DB untouched.
    hotels: (hotels.data ?? []).map(mapHotel).filter((h) => h.type !== "airbnb"),
    activities: (activities.data ?? []).map(mapActivity),
    slots: (slots.data ?? []).map(mapSlot),
    families: (families.data ?? []).map(mapFamily),
  };
}

export function checkAdminPasscode(req: Request): { ok: boolean; status: number; message?: string } {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return { ok: false, status: 503, message: "ADMIN_PASSCODE is not configured" };
  const got = req.headers.get("x-admin-passcode");
  if (got !== expected) return { ok: false, status: 401, message: "Wrong passcode" };
  return { ok: true, status: 200 };
}
