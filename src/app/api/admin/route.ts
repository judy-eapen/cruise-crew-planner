import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { checkAdminPasscode, getSupabase } from "@/lib/db";
import { SEED } from "@/data/trip";

export const dynamic = "force-dynamic";

const newToken = () => randomBytes(5).toString("hex"); // 10-char vote-link token
const today = () => new Date().toISOString().slice(0, 10);

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const auth = checkAdminPasscode(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const action: string = body.action;
  const payload: any = body.payload ?? {};

  try {
    switch (action) {
      case "ping":
        return NextResponse.json({ ok: true });

      // Load (or reload) the bundled seed data. Upserts, so re-running is safe;
      // existing family tokens, family edits, and votes are preserved.
      case "seed": {
        const err = async (p: PromiseLike<{ error: any }>) => {
          const { error } = await p;
          if (error) throw new Error(error.message);
        };
        await err(
          supabase.from("date_options").upsert(
            SEED.dateOptions.map((o) => ({
              id: o.id,
              label: o.label,
              depart_date: o.departDate,
              return_date: o.returnDate,
              pre_nights: o.preNights,
              post_nights: o.postNights,
              hotel_nights: o.hotelNights,
            }))
          )
        );
        // Flight quotes: only seed if the table is empty (quotes are identity-keyed).
        const { count } = await supabase.from("flights").select("*", { count: "exact", head: true });
        if (!count) {
          await err(
            supabase.from("flights").insert(
              SEED.flights.map((f) => ({
                option_id: f.optionId,
                origin: f.origin,
                airline: f.airline,
                depart_time: f.departTime,
                return_time: f.returnTime,
                fare_per_person: f.farePerPerson,
                bag_fee: f.bagFee,
                estimate: f.estimate,
                price_checked: f.priceChecked,
              }))
            )
          );
        }
        await err(
          supabase.from("hotels").upsert(
            SEED.hotels.map((h) => ({
              id: h.id,
              name: h.name,
              price: h.price,
              price_mode: h.priceMode,
              stars: h.stars,
              area: h.area,
              type: h.type,
              pool: h.pool,
              breakfast_included: h.breakfastIncluded,
              amenities: h.amenities,
              estimate: h.estimate,
            }))
          )
        );
        await err(
          supabase.from("activities").upsert(
            SEED.activities.map((a) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              adult_price: a.adultPrice,
              child_price: a.childPrice,
              category: a.category,
              age_fit: a.ageFit,
              area: a.area,
              star: a.star,
              estimate: a.estimate,
              note: a.note ?? null,
            }))
          )
        );
        await err(
          supabase.from("itinerary_slots").upsert(
            SEED.slots.map((s) => ({
              option_id: s.optionId,
              date: s.date,
              day_label: s.dayLabel,
              slot_type: s.slotType,
              activity_id: s.activityId,
            })),
            { onConflict: "option_id,date" }
          )
        );
        // Families: only insert missing ones so tokens/edits survive re-seeding.
        const { data: existing } = await supabase.from("families").select("id");
        const have = new Set((existing ?? []).map((r: any) => r.id));
        const missing = SEED.families.filter((f) => !have.has(f.id));
        if (missing.length) {
          const { error } = await supabase.from("families").insert(
            missing.map((f) => ({
              id: f.id,
              name: f.name,
              adults: f.adults,
              kids_3_9: f.kids39,
              kids_10plus: f.kids10plus,
              rooms: f.rooms,
              bags: f.bags,
              placeholder: f.placeholder,
              token: newToken(),
            }))
          );
          if (error) throw new Error(error.message);
        }
        return NextResponse.json({ ok: true, seeded: true, familiesAdded: missing.length });
      }

      case "links": {
        const [fams, votes] = await Promise.all([
          supabase.from("families").select("id,name,token").order("id"),
          supabase.from("votes").select("family_id"),
        ]);
        if (fams.error) throw new Error(fams.error.message);
        const voted = new Set((votes.data ?? []).map((v: any) => v.family_id));
        return NextResponse.json({
          links: (fams.data ?? []).map((f: any) => ({ id: f.id, name: f.name, token: f.token, voted: voted.has(f.id) })),
        });
      }

      case "add-quote": {
        const { optionId, origin, airline, departTime, returnTime, farePerPerson, bagFee } = payload;
        if (!airline || !String(airline).trim()) throw new Error("Airline name is required");
        const { error } = await supabase.from("flights").insert({
          option_id: optionId,
          origin,
          airline: String(airline).trim().slice(0, 60),
          depart_time: String(departTime ?? "").slice(0, 80) || "TBD",
          return_time: String(returnTime ?? "").slice(0, 80) || "TBD",
          fare_per_person: Number(farePerPerson),
          bag_fee: Number(bagFee ?? 0),
          estimate: false,
          price_checked: today(),
        });
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "update-quote": {
        const { id, farePerPerson, bagFee, departTime, returnTime } = payload;
        const { error } = await supabase
          .from("flights")
          .update({
            fare_per_person: Number(farePerPerson),
            bag_fee: Number(bagFee ?? 0),
            depart_time: String(departTime ?? "TBD").slice(0, 80),
            return_time: String(returnTime ?? "TBD").slice(0, 80),
            estimate: false,
            price_checked: today(),
          })
          .eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "delete-quote": {
        const { error } = await supabase.from("flights").delete().eq("id", payload.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "upsert-hotel": {
        const { id, name, price, priceMode, stars, area, type, pool, breakfastIncluded, amenities } = payload;
        const hotelId = id || `H${Date.now().toString(36)}`;
        const { error } = await supabase.from("hotels").upsert({
          id: hotelId,
          name: String(name).slice(0, 120),
          price: Number(price),
          price_mode: priceMode === "per_property_night_split" ? "per_property_night_split" : "per_room_night",
          stars: Math.min(5, Math.max(1, Number(stars ?? 3))),
          area: String(area ?? "").slice(0, 80),
          type: type === "airbnb" ? "airbnb" : "hotel",
          pool: Boolean(pool),
          breakfast_included: Boolean(breakfastIncluded),
          amenities: String(amenities ?? "").slice(0, 200),
          estimate: false,
        });
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true, id: hotelId });
      }

      case "delete-hotel": {
        const { error } = await supabase.from("hotels").delete().eq("id", payload.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "update-activity": {
        const { id, adultPrice, childPrice, ageFit, area } = payload;
        const { error } = await supabase
          .from("activities")
          .update({
            adult_price: Number(adultPrice),
            child_price: Number(childPrice),
            age_fit: ["all", "younger", "older", "check"].includes(ageFit) ? ageFit : "all",
            area: ["orlando", "port", "daytrip"].includes(area) ? area : "orlando",
            estimate: false,
          })
          .eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "update-family": {
        const { id, name, adults, kids39, kids10plus, rooms, bags } = payload;
        const { error } = await supabase
          .from("families")
          .update({
            name: String(name).slice(0, 60),
            adults: Number(adults),
            kids_3_9: Number(kids39),
            kids_10plus: Number(kids10plus),
            rooms: Number(rooms),
            bags: Number(bags ?? 2),
            placeholder: false,
          })
          .eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unexpected error" }, { status: 500 });
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
