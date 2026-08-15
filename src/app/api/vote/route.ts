import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const OPTION_IDS = ["A", "B", "C", "D", "E", "F"];

// One updatable vote per family; identity = the family's secret token.
export async function POST(req: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Voting opens once the database is connected." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const firstChoice = body?.firstChoice;
  const secondChoice = body?.secondChoice ?? null;
  const comment = typeof body?.comment === "string" ? body.comment.slice(0, 500) : null;

  if (!token || !OPTION_IDS.includes(firstChoice) || (secondChoice && !OPTION_IDS.includes(secondChoice))) {
    return NextResponse.json({ error: "Invalid vote." }, { status: 400 });
  }

  const { data: family, error: famErr } = await supabase
    .from("families")
    .select("id,name")
    .eq("token", token)
    .maybeSingle();
  if (famErr) return NextResponse.json({ error: famErr.message }, { status: 500 });
  if (!family) return NextResponse.json({ error: "That vote link isn't valid." }, { status: 403 });

  const { error } = await supabase.from("votes").upsert(
    {
      family_id: family.id,
      first_choice: firstChoice,
      second_choice: secondChoice,
      comment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "family_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, familyName: family.name });
}
