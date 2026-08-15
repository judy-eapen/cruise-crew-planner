import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { checkAdminPasscode, getSupabase } from "@/lib/db";
import { SEED } from "@/data/trip";

export const dynamic = "force-dynamic";

const newToken = () => randomBytes(5).toString("hex"); // 10-char vote-link token

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
      // existing family tokens and votes are preserved.
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
        await err(
          supabase.from("flights").upsert(
            SEED.flights.map((f) => ({
              option_id: f.optionId,
              origin: f.origin,
              airline: f.airline,
              fare_per_person: f.farePerPerson,
              estimate: f.estimate,
              price_checked: f.priceChecked,
            })),
            { onConflict: "option_id,origin,airline" }
          )
        );
        await err(
          supabase.from("hotels").upsert(
            SEED.hotels.map((h) => ({
              id: h.id,
              name: h.name,
              nightly_rate: h.nightlyRate,
              breakfast_included: h.breakfastIncluded,
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

      case "upsert-flight": {
        const { optionId, origin, airline, farePerPerson, estimate } = payload;
        if (!airline || !String(airline).trim()) throw new Error("Airline name is required");
        const { error } = await supabase.from("flights").upsert(
          {
            option_id: optionId,
            origin,
            airline: String(airline).trim().slice(0, 60),
            fare_per_person: Number(farePerPerson),
            estimate: Boolean(estimate),
            price_checked: new Date().toISOString().slice(0, 10),
          },
          { onConflict: "option_id,origin,airline" }
        );
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "delete-flight": {
        const { optionId, origin, airline } = payload;
        const { error } = await supabase
          .from("flights")
          .delete()
          .eq("option_id", optionId)
          .eq("origin", origin)
          .eq("airline", airline);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "upsert-hotel": {
        const { id, name, nightlyRate, breakfastIncluded, estimate } = payload;
        const hotelId = id || `H${Date.now().toString(36)}`;
        const { error } = await supabase.from("hotels").upsert({
          id: hotelId,
          name: String(name).slice(0, 120),
          nightly_rate: Number(nightlyRate),
          breakfast_included: Boolean(breakfastIncluded),
          estimate: Boolean(estimate),
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
        const { id, adultPrice, childPrice, estimate } = payload;
        const { error } = await supabase
          .from("activities")
          .update({ adult_price: Number(adultPrice), child_price: Number(childPrice), estimate: Boolean(estimate) })
          .eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "update-family": {
        const { id, name, adults, kids39, kids10plus, rooms } = payload;
        const { error } = await supabase
          .from("families")
          .update({
            name: String(name).slice(0, 60),
            adults: Number(adults),
            kids_3_9: Number(kids39),
            kids_10plus: Number(kids10plus),
            rooms: Number(rooms),
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
