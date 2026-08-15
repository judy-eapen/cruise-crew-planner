import Link from "next/link";
import { getSupabase, getTripData } from "@/lib/db";
import VoteForm from "@/components/VoteForm";

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(168deg,#0a0e2a_0%,#171247_35%,#2a1a68_68%,#3d2384_100%)] px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-display text-xl tracking-wide">
          🏰 Cruise<span className="text-amber-300">Crew</span> ✨
        </Link>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default async function VotePage(props: PageProps<"/vote/[token]">) {
  const { token } = await props.params;
  const supabase = getSupabase();

  if (!supabase) {
    return (
      <Shell>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
          <p className="text-4xl">🔌</p>
          <h1 className="mt-3 text-xl font-bold">Voting isn&apos;t open yet</h1>
          <p className="mt-2 text-sm text-slate-300">The database isn&apos;t connected. Check back soon!</p>
        </div>
      </Shell>
    );
  }

  const { data: family } = await supabase
    .from("families")
    .select("id,name,adults,kids_3_9,kids_10plus,rooms")
    .eq("token", token)
    .maybeSingle();

  if (!family) {
    return (
      <Shell>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
          <p className="text-4xl">🧭</p>
          <h1 className="mt-3 text-xl font-bold">Hmm, that link doesn&apos;t look right</h1>
          <p className="mt-2 text-sm text-slate-300">
            Vote links are private per family — double-check the link you were sent, or ask the trip
            organizer for a fresh one.
          </p>
        </div>
      </Shell>
    );
  }

  const [{ data: existing }, trip] = await Promise.all([
    supabase
      .from("votes")
      .select("first_choice, second_choice, comment")
      .eq("family_id", family.id)
      .maybeSingle(),
    getTripData(),
  ]);

  return (
    <Shell>
      <VoteForm
        token={token}
        familyName={family.name}
        options={trip.dateOptions}
        existing={
          existing
            ? {
                firstChoice: existing.first_choice,
                secondChoice: existing.second_choice,
                comment: existing.comment ?? "",
              }
            : null
        }
      />
    </Shell>
  );
}
