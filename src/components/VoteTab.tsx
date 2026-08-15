"use client";

import { useEffect, useState } from "react";
import type { TripData, VoteRecord } from "@/lib/types";
import { shortDate } from "@/lib/dates";

interface Results {
  enabled: boolean;
  votes: VoteRecord[];
  totalFamilies: number;
}

export default function VoteTab({ data }: { data: TripData }) {
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    fetch("/api/votes")
      .then((r) => r.json())
      .then(setResults)
      .catch(() => setResults({ enabled: false, votes: [], totalFamilies: 0 }));
  }, []);

  if (!results) {
    return <p className="py-10 text-center text-sm text-slate-400">Counting ballots… ✨</p>;
  }

  if (!results.enabled) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center backdrop-blur-md">
        <p className="text-5xl">🗳️✨</p>
        <h2 className="font-display mt-3 text-2xl tracking-wide text-white">Family voting — almost here</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-300">
          Each family gets a private vote link (no logins — your link is your identity). One vote per family,
          editable until we book, with live results everyone can see.
        </p>
        <p className="mt-5 text-xs text-slate-500">Opens once the database is connected.</p>
      </div>
    );
  }

  const tally = new Map<string, { first: number; second: number }>();
  for (const o of data.dateOptions) tally.set(o.id, { first: 0, second: 0 });
  for (const v of results.votes) {
    const f = tally.get(v.firstChoice);
    if (f) f.first += 1;
    if (v.secondChoice) {
      const s = tally.get(v.secondChoice);
      if (s) s.second += 1;
    }
  }
  const leader = [...tally.entries()].sort((a, b) => b[1].first - a[1].first || b[1].second - a[1].second)[0];
  const turnout = results.votes.length;

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-white">The crew has spoken (so far)</h2>
      <p className="mt-1 text-sm text-slate-400">
        {turnout} of {results.totalFamilies} families have voted
        {turnout > 0 && leader && leader[1].first > 0 && (
          <>
            {" "}
            · current leader: <span className="font-bold text-amber-200">Option {leader[0]}</span>
          </>
        )}
        . Votes are editable until we book — use your family&apos;s private link.
      </p>

      {/* Tally bars */}
      <div className="mt-5 space-y-2.5">
        {data.dateOptions.map((o) => {
          const t = tally.get(o.id)!;
          const width = results.totalFamilies ? (t.first / results.totalFamilies) * 100 : 0;
          return (
            <div key={o.id} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm font-bold text-white">Option {o.id}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="flex h-full items-center rounded-full bg-gradient-to-r from-amber-300 to-pink-400 px-2 text-xs font-bold text-indigo-950 transition-all"
                  style={{ width: `${Math.max(width, t.first > 0 ? 12 : 0)}%` }}
                >
                  {t.first > 0 && t.first}
                </div>
              </div>
              <span className="w-24 shrink-0 text-xs text-slate-400">
                {t.second > 0 ? `+${t.second} backup` : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Individual votes — transparency is the guardrail */}
      {turnout > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.votes.map((v) => (
            <div key={v.familyId} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="font-bold text-white">{v.familyName}</p>
              <p className="mt-1 text-sm text-amber-200">
                Top: Option {v.firstChoice}
                {v.secondChoice && <span className="text-slate-300"> · backup {v.secondChoice}</span>}
              </p>
              {v.comment && <p className="mt-1.5 text-xs italic text-slate-300">&ldquo;{v.comment}&rdquo;</p>}
              <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-500">
                updated {shortDate(v.updatedAt.slice(0, 10))}
              </p>
            </div>
          ))}
        </div>
      )}

      {turnout === 0 && (
        <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
          No votes yet — links went out in the chat! ✨
        </p>
      )}
    </div>
  );
}
