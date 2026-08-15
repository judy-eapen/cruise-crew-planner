"use client";

import { useState } from "react";
import type { DateOption, OptionId } from "@/lib/types";
import { shortDate } from "@/lib/dates";

interface Existing {
  firstChoice: OptionId;
  secondChoice: OptionId | null;
  comment: string;
}

export default function VoteForm({
  token,
  familyName,
  options,
  existing,
}: {
  token: string;
  familyName: string;
  options: DateOption[];
  existing: Existing | null;
}) {
  const [first, setFirst] = useState<OptionId | null>(existing?.firstChoice ?? null);
  const [second, setSecond] = useState<OptionId | null>(existing?.secondChoice ?? null);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!first) return;
    setState("saving");
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, firstChoice: first, secondChoice: second, comment }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("done");
      setMessage("Vote saved! You can come back and change it any time before we book. ✨");
    } else {
      setState("error");
      setMessage(json.error ?? "Something went wrong — try again.");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
      <p className="font-script text-xl text-pink-300">hello, {familyName}! 👋</p>
      <h1 className="font-display mt-1 text-3xl tracking-wide text-white">Cast your family&apos;s vote</h1>
      <p className="mt-2 text-sm text-slate-300">
        Pick your <span className="font-semibold text-amber-200">top choice</span> (and a backup if you have
        one). One vote per family — voting again just updates it. Results are visible to everyone.
      </p>

      <h2 className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Top choice</h2>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => {
              setFirst(o.id);
              if (second === o.id) setSecond(null);
            }}
            className={`rounded-2xl border p-3 text-left transition ${
              first === o.id
                ? "border-amber-300 bg-amber-300/15"
                : "border-white/10 bg-white/5 hover:border-white/30"
            }`}
          >
            <span className={`font-bold ${first === o.id ? "text-amber-200" : "text-white"}`}>
              Option {o.id}
            </span>
            <span className="block text-xs text-slate-300">
              {shortDate(o.departDate)} → {shortDate(o.returnDate)} · {o.hotelNights} hotel nights
            </span>
          </button>
        ))}
      </div>

      <h2 className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Backup choice (optional)
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {options
          .filter((o) => o.id !== first)
          .map((o) => (
            <button
              key={o.id}
              onClick={() => setSecond(second === o.id ? null : o.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                second === o.id ? "bg-pink-400 text-indigo-950" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {o.id}
            </button>
          ))}
      </div>

      <h2 className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Anything the group should know? (optional)
      </h2>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="e.g. We can't fly Saturday morning; kids have a game."
        className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 p-3 text-sm text-white placeholder:text-slate-500"
      />

      <button
        onClick={submit}
        disabled={!first || state === "saving"}
        className="mt-5 w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-indigo-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {state === "saving" ? "Saving…" : existing ? "Update our vote" : "Cast our vote"} ✨
      </button>

      {message && (
        <p className={`mt-3 text-sm ${state === "error" ? "text-pink-300" : "text-emerald-300"}`}>{message}</p>
      )}
    </div>
  );
}
