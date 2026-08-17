import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public results: who voted for what, when. Transparency is the guardrail.
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ enabled: false, votes: [], totalFamilies: 0 });
  }

  const [votesRes, famRes] = await Promise.all([
    supabase.from("votes").select("family_id, first_choice, second_choice, comment, updated_at"),
    supabase.from("families").select("id,name,builds"),
  ]);
  if (votesRes.error || famRes.error) {
    return NextResponse.json({ enabled: false, votes: [], totalFamilies: 0 });
  }

  const names = new Map((famRes.data ?? []).map((f) => [f.id, f.name]));
  // Each family's saved builds ride along so results can show WHAT they voted for
  // (their curated flight/hotels/activities), not just the option letter.
  const builds = Object.fromEntries((famRes.data ?? []).map((f) => [f.id, f.builds ?? {}]));
  const votes = (votesRes.data ?? []).map((v) => ({
    familyId: v.family_id,
    familyName: names.get(v.family_id) ?? v.family_id,
    firstChoice: v.first_choice,
    secondChoice: v.second_choice,
    comment: v.comment,
    updatedAt: v.updated_at,
  }));

  return NextResponse.json({ enabled: true, votes, totalFamilies: famRes.data?.length ?? 0, builds });
}
