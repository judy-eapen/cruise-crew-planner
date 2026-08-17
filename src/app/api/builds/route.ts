// Family build sync — one main URL for everyone: pick your family, curate, and the
// picks save to the family row (honor-system identity, fine for 7 friendly families).
// Server route uses the service-role key; RLS keeps anon locked out of direct access.

import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const OPTION_IDS = ["A", "B", "C", "D", "E", "F"] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
function cleanBuilds(raw: any): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const id of OPTION_IDS) {
    const b = raw[id];
    if (!b || typeof b !== "object") continue;
    const activities: Record<string, string | null> = {};
    if (b.activities && typeof b.activities === "object") {
      for (const [date, v] of Object.entries(b.activities)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) activities[date] = typeof v === "string" ? v.slice(0, 40) : null;
      }
    }
    out[id] = {
      flightId: typeof b.flightId === "number" ? b.flightId : null,
      preHotelId: typeof b.preHotelId === "string" ? b.preHotelId.slice(0, 40) : null,
      postHotelId: typeof b.postHotelId === "string" ? b.postHotelId.slice(0, 40) : null,
      activities,
    };
  }
  return out;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function GET(req: Request) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ builds: {} });
  const familyId = new URL(req.url).searchParams.get("family") ?? "";
  const { data } = await supabase.from("families").select("builds").eq("id", familyId).single();
  return NextResponse.json({ builds: data?.builds ?? {} });
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const familyId = String(body.familyId ?? "").slice(0, 20);
  if (!familyId || familyId === "custom") return NextResponse.json({ error: "No family" }, { status: 400 });
  const { error } = await supabase.from("families").update({ builds: cleanBuilds(body.builds) }).eq("id", familyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
