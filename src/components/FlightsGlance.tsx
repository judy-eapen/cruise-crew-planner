"use client";

import type { Build, OptionId, TripData } from "@/lib/types";
import { fmt, quoteCostForParty, quotesForOption, type PartySize } from "@/lib/pricing";
import { shortDate } from "@/lib/dates";

export default function FlightsGlance({
  data,
  party,
  familyLabel,
  selectedOption,
  buildFor,
  onPickQuote,
  onSelectOption,
}: {
  data: TripData;
  party: PartySize;
  familyLabel: string;
  selectedOption: OptionId;
  buildFor: (id: OptionId) => Build;
  onPickQuote: (optionId: OptionId, quoteId: number) => void;
  onSelectOption: (id: OptionId) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-xl tracking-wide text-white">✈️ Flights at a glance — all six options</h3>
      <p className="text-xs text-slate-400">
        Prices are what {familyLabel} would pay · 💰 = cheapest for that option · tap a flight to use it in your build
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.dateOptions.map((o) => {
          const quotes = quotesForOption(data, o.id)
            .slice()
            .sort((a, b) => quoteCostForParty(a, party) - quoteCostForParty(b, party));
          const cheapest = quotes.length ? quoteCostForParty(quotes[0], party) : 0;
          const build = buildFor(o.id);
          const chosenId = build.flightId ?? quotes[0]?.id ?? null;
          const freeDays = data.slots
            .filter((s) => s.optionId === o.id)
            .reduce((t, s) => t + (s.slotType === "full" ? 1 : s.slotType === "half" ? 0.5 : 0), 0);
          const isActive = o.id === selectedOption;
          return (
            <div
              key={o.id}
              className={`rounded-3xl border p-4 backdrop-blur-md transition ${
                isActive ? "border-amber-300/60 bg-amber-300/5" : "border-white/10 bg-white/5"
              }`}
            >
              <button onClick={() => onSelectOption(o.id)} className="flex w-full items-baseline justify-between text-left">
                <span className={`text-lg font-bold ${isActive ? "text-amber-200" : "text-white"}`}>Option {o.id}</span>
                <span className="text-xs text-slate-400">
                  {shortDate(o.departDate)} → {shortDate(o.returnDate)} · {freeDays} free day{freeDays !== 1 ? "s" : ""}
                </span>
              </button>
              <div className="mt-2.5 space-y-1.5">
                {quotes.map((q) => {
                  const cost = quoteCostForParty(q, party);
                  const isCheapest = cost === cheapest;
                  const isChosen = q.id === chosenId;
                  return (
                    <button
                      key={q.id}
                      onClick={() => onPickQuote(o.id, q.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        isChosen ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`text-sm font-semibold ${isChosen ? "text-amber-200" : "text-slate-100"}`}>
                          {q.airline} · {q.origin}
                          {isChosen && " ✓"}
                        </span>
                        <span className={`text-sm font-bold tabular-nums ${isCheapest ? "text-emerald-300" : "text-slate-200"}`}>
                          {isCheapest && "💰 "}
                          {q.estimate && "~"}
                          {fmt(cost)}
                        </span>
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        out {q.outDepart} → {q.outArrive} · back {q.retDepart} → {q.retArrive}
                        {q.bagFee > 0 ? ` · +${fmt(q.bagFee)}/bag` : " · bags incl."}
                      </span>
                    </button>
                  );
                })}
                {quotes.length === 0 && <p className="text-xs text-slate-500">No quotes yet.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
