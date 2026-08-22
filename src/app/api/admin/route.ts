import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { checkAdminPasscode, getSupabase } from "@/lib/db";
import { fetchQuotesForOption } from "@/lib/serpapi";
import { SEED } from "@/data/trip";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // fare refreshes make several sequential SerpApi calls

const newToken = () => randomBytes(5).toString("hex"); // 10-char vote-link token
// Stamp dates in the trip's timezone — toISOString() is UTC and rolls to "tomorrow"
// after 8pm ET, which mislabeled evening fare fetches. en-CA formats as YYYY-MM-DD.
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

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
                out_depart: f.outDepart,
                out_arrive: f.outArrive,
                ret_depart: f.retDepart,
                ret_arrive: f.retArrive,
                duration: f.duration,
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
              stay_pre2: h.stayPre2,
              stay_pre1: h.stayPre1,
              stay_post2: h.stayPost2,
              stay_post1: h.stayPost1,
              price_mode: h.priceMode,
              stars: h.stars,
              area: h.area,
              type: h.type,
              pool: h.pool,
              breakfast_included: h.breakfastIncluded,
              amenities: h.amenities,
              link: h.link,
              shared_families: h.sharedFamilies,
              bedrooms: h.bedrooms,
              beds: h.beds,
              baths: h.baths,
              sleeps: h.sleeps,
              cancellation: h.cancellation,
              estimate: h.estimate,
            }))
          )
        );
        // Activities: only insert missing ones so admin price edits survive re-seeding.
        const { data: existingActs } = await supabase.from("activities").select("id");
        const haveActs = new Set((existingActs ?? []).map((r: any) => r.id));
        const missingActs = SEED.activities.filter((a) => !haveActs.has(a.id));
        if (missingActs.length)
        await err(
          supabase.from("activities").insert(
            missingActs.map((a) => ({
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
              ticket_link: a.ticketLink ?? "",
              age_notes_younger: a.ageNotesYounger ?? "",
              age_notes_older: a.ageNotesOlder ?? "",
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

      case "export": {
        const tables = ["date_options", "flights", "hotels", "activities", "itinerary_slots", "families", "votes"];
        const dump: Record<string, unknown> = { exportedAt: new Date().toISOString() };
        for (const t of tables) {
          const { data, error } = await supabase.from(t).select("*");
          if (error) throw new Error(`${t}: ${error.message}`);
          dump[t] = data;
        }
        return NextResponse.json(dump);
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
        const { optionId, origin, airline, outDepart, outArrive, retDepart, retArrive, duration, farePerPerson, bagFee, plane } = payload;
        if (!airline || !String(airline).trim()) throw new Error("Airline name is required");
        const { error } = await supabase.from("flights").insert({
          option_id: optionId,
          origin,
          airline: String(airline).trim().slice(0, 60),
          out_depart: String(outDepart ?? "").slice(0, 40) || "TBD",
          out_arrive: String(outArrive ?? "").slice(0, 40) || "TBD",
          ret_depart: String(retDepart ?? "").slice(0, 40) || "TBD",
          ret_arrive: String(retArrive ?? "").slice(0, 40) || "TBD",
          duration: String(duration ?? "").slice(0, 30) || "~2h 15m",
          fare_per_person: Number(farePerPerson),
          bag_fee: Number(bagFee ?? 50),
          plane: String(plane ?? "").trim().slice(0, 60) || null,
          estimate: false,
          price_checked: today(),
        });
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "update-quote": {
        const { id, airline, origin, farePerPerson, bagFee, outDepart, outArrive, retDepart, retArrive, duration, plane } = payload;
        if (!airline || !String(airline).trim()) throw new Error("Airline name is required");
        const { error } = await supabase
          .from("flights")
          .update({
            airline: String(airline).trim().slice(0, 60),
            origin: ["IAD", "DCA", "BWI"].includes(origin) ? origin : undefined,
            fare_per_person: Number(farePerPerson),
            bag_fee: Number(bagFee ?? 50),
            out_depart: String(outDepart ?? "TBD").slice(0, 40),
            out_arrive: String(outArrive ?? "TBD").slice(0, 40),
            ret_depart: String(retDepart ?? "TBD").slice(0, 40),
            ret_arrive: String(retArrive ?? "TBD").slice(0, 40),
            duration: String(duration ?? "~2h 15m").slice(0, 30),
            plane: String(plane ?? "").trim().slice(0, 60) || null,
            estimate: false,
            price_checked: today(),
            // Hand-editing a fetched row adopts it as manual so refreshes can't wipe the edit.
            source: "manual",
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

      // Live fares via SerpApi Google Flights — ONE option per call (the client
      // loops so each request stays under Vercel's time limit and shows progress).
      // Only rows with source='api' are ever replaced; manual rows are untouchable.
      case "refresh-fares": {
        const { optionId, outboundTimes, returnTimes, nonstopOnly, excludeMax8, includeAirlines } = payload;
        const { data: opt, error: optErr } = await supabase
          .from("date_options")
          .select("id,depart_date,return_date,post_nights")
          .eq("id", optionId)
          .single();
        if (optErr || !opt) throw new Error(`Unknown option: ${optionId}`);

        // Off-ship-9am options (no post-cruise nights): the return flight can't
        // realistically leave before ~1 PM, so enforce a 13:00 floor.
        let retWin = String(returnTimes ?? "");
        if (opt.post_nights === 0) {
          const parts = /^\d{1,2},\d{1,2}(,\d{1,2},\d{1,2})?$/.test(retWin) ? retWin.split(",").map(Number) : [13, 23];
          parts[0] = Math.max(13, parts[0]); // depart no earlier than 1 PM
          parts[1] = Math.max(14, parts[1]);
          retWin = parts.join(",");
        }

        const result = await fetchQuotesForOption(opt.depart_date, opt.return_date, {
          outboundTimes: String(outboundTimes ?? ""),
          returnTimes: retWin,
          nonstopOnly: nonstopOnly !== false, // default on
          excludeMax8: excludeMax8 !== false, // default on
          includeAirlines: String(includeAirlines ?? ""),
        });
        if (result.quotes.length) {
          const del = await supabase.from("flights").delete().eq("option_id", opt.id).eq("source", "api");
          if (del.error) throw new Error(del.error.message);
          const rows = result.quotes.map((q) => ({
            option_id: opt.id,
            origin: q.origin,
            airline: q.airline,
            out_depart: q.outDepart,
            out_arrive: q.outArrive,
            ret_depart: q.retDepart,
            ret_arrive: q.retArrive,
            duration: q.duration,
            fare_per_person: q.farePerPerson,
            bag_fee: q.bagFee,
            plane: q.plane || null,
            estimate: false,
            price_checked: today(),
            source: "api",
          }));
          let ins = await supabase.from("flights").insert(rows);
          // The api rows are already deleted at this point, so if the plane column
          // migration hasn't run yet, retry without it rather than losing the quotes.
          if (ins.error && /plane/i.test(ins.error.message)) {
            ins = await supabase.from("flights").insert(rows.map(({ plane: _plane, ...r }) => r));
          }
          if (ins.error) throw new Error(ins.error.message);
        }
        return NextResponse.json({
          ok: true,
          optionId: opt.id,
          added: result.quotes.length,
          searches: result.searches,
          warnings: result.warnings,
        });
      }

      case "upsert-hotel": {
        const { id, name, stayPre2, stayPre1, stayPost2, stayPost1, priceMode, stars, area, type, pool, breakfastIncluded, amenities, link, sharedFamilies, bedrooms, beds, baths, sleeps, cancellation } = payload;
        const hotelId = id || `H${Date.now().toString(36)}`;
        const { error } = await supabase.from("hotels").upsert({
          id: hotelId,
          name: String(name).slice(0, 120),
          stay_pre2: Number(stayPre2),
          stay_pre1: Number(stayPre1 ?? 0),
          stay_post2: Number(stayPost2 ?? 0),
          stay_post1: Number(stayPost1 ?? 0),
          price_mode: priceMode === "per_property_night_split" ? "per_property_night_split" : "per_room_night",
          stars: Math.min(5, Math.max(1, Number(stars ?? 3))),
          area: String(area ?? "").slice(0, 80),
          type: type === "airbnb" ? "airbnb" : "hotel",
          pool: Boolean(pool),
          breakfast_included: Boolean(breakfastIncluded),
          amenities: String(amenities ?? "").slice(0, 200),
          link: String(link ?? "").slice(0, 300),
          shared_families: Math.max(1, Number(sharedFamilies ?? 7)),
          bedrooms: Number(bedrooms ?? 0),
          beds: Number(beds ?? 0),
          baths: Number(baths ?? 0),
          sleeps: Number(sleeps ?? 0),
          cancellation: String(cancellation ?? "").slice(0, 120),
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
        const { id, adultPrice, childPrice, ageFit, area, datePrices, ticketLink, star, estimate, ageNotesYounger, ageNotesOlder } = payload;
        const cleanDates: Record<string, { adult: number; child: number }> = {};
        if (datePrices && typeof datePrices === "object") {
          for (const [d, p] of Object.entries(datePrices as Record<string, { adult: unknown; child: unknown }>)) {
            const adult = Number(p?.adult);
            const child = Number(p?.child);
            if (/^\d{4}-\d{2}-\d{2}$/.test(d) && adult > 0) cleanDates[d] = { adult, child: child > 0 ? child : adult };
          }
        }
        const { error } = await supabase
          .from("activities")
          .update({
            adult_price: Number(adultPrice),
            child_price: Number(childPrice),
            date_prices: cleanDates,
            age_fit: ["all", "younger", "older", "check"].includes(ageFit) ? ageFit : "all",
            area: ["orlando", "port", "daytrip"].includes(area) ? area : "orlando",
            ticket_link: String(ticketLink ?? "").slice(0, 300),
            age_notes_younger: String(ageNotesYounger ?? "").slice(0, 200),
            age_notes_older: String(ageNotesOlder ?? "").slice(0, 200),
            star: Boolean(star),
            // Estimate flag is now explicit (the ~est checkbox) instead of force-cleared on save.
            estimate: Boolean(estimate),
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
