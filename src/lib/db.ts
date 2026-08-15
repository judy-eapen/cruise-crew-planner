// Server-only Supabase access. All reads/writes use the service-role key
// (never exposed to the browser); RLS denies the anonymous role entirely,
// so the API routes in src/app/api are the only doorway to the data.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SEED } from "@/data/trip";
import type {
  Activity,
  DateOption,
  Family,
  Flight,
  Hotel,
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
const mapFlight = (r: any): Flight => ({
  optionId: r.option_id as OptionId,
  origin: r.origin as Origin,
  farePerPerson: Number(r.fare_per_person),
  estimate: r.estimate,
  priceChecked: r.price_checked,
});
const mapHotel = (r: any): Hotel => ({
  id: r.id,
  name: r.name,
  nightlyRate: Number(r.nightly_rate),
  breakfastIncluded: r.breakfast_included,
  estimate: r.estimate,
});
const mapActivity = (r: any): Activity => ({
  id: r.id,
  name: r.name,
  type: r.type,
  adultPrice: Number(r.adult_price),
  childPrice: Number(r.child_price),
  category: r.category,
  star: r.star,
  estimate: r.estimate,
  note: r.note ?? undefined,
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
    supabase.from("families").select("id,name,adults,kids_3_9,kids_10plus,rooms,placeholder").order("id"),
  ]);

  // Not seeded yet (or schema missing) → keep serving the bundled seed.
  if (opts.error || !opts.data?.length) return SEED;

  return {
    source: "db",
    dateOptions: opts.data.map(mapOption),
    flights: (flights.data ?? []).map(mapFlight),
    hotels: (hotels.data ?? []).map(mapHotel),
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
