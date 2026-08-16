"use client";

import type { Build, OptionId, TripData } from "@/lib/types";
import { fmt, quoteCostForParty, quotesForOption, type PartySize } from "@/lib/pricing";
import { isoRange, shortDay } from "@/lib/dates";

const CRUISE_DAYS = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"];

/** Miniature journey strip: plane on fly days, ship Nov 2–5, activity icons between. */
function MiniDayStrip({ data, optionId }: { data: TripData; optionId: OptionId }) {
  const option = data.dateOptions.find((o) => o.id === optionId)!;
  const slots = data.slots.filter((s) => s.optionId === optionId);
  const days = isoRange(option.departDate, option.returnDate);
  const info = (iso: string): { type: string; icon: string } => {
    if (iso === option.departDate || iso === option.returnDate) return { type: "travel", icon: "✈️" };
    if (CRUISE_DAYS.includes(iso)) return { type: "cruise", icon: "🚢" };
    const slot = slots.find((s) => s.date === iso);
    if (slot?.slotType === "full") return { type: "full", icon: "🎢" };
    if (slot?.slotType === "half") return { type: "half", icon: "🌤" };
    return { type: "travel", icon: "✈️" };
  };
  const chip = (t: string) =>
    t === "cruise"
      ? "bg-gradient-to-b from-indigo-500 to-fuchsia-600 text-white"
      : t === "travel"
        ? "bg-white/10 text-slate-300"
        : t === "full"
          ? "bg-amber-300 text-indigo-950"
          : "bg-amber-200/30 text-amber-100";
  return (
    <div className="mt-2 flex gap-1">
      {days.map((iso) => {
        const d = info(iso);
        return (
          <div key={iso} className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 ${chip(d.type)}`}>
            <span className="text-[8px] font-bold uppercase leading-none opacity-75">{shortDay(iso)}</span>
            <span className="text-[11px] font-extrabold leading-tight">{Number(iso.slice(8))}</span>
            <span className="text-[10px] leading-none">{d.icon}</span>
          </div>
        );
      })}
    </div>
  );
}

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
          const freeDays = data.slots.filter((s) => s.optionId === o.id && s.slotType === "full").length;
          const isActive = o.id === selectedOption;
          return (
            <div
              key={o.id}
              className={`rounded-3xl border p-4 backdrop-blur-md transition ${
                isActive ? "border-amber-300/60 bg-amber-300/5" : "border-white/10 bg-white/5"
              }`}
            >
              <button onClick={() => onSelectOption(o.id)} className="w-full text-left">
                <span className="flex items-baseline justify-between">
                  <span className={`text-lg font-bold ${isActive ? "text-amber-200" : "text-white"}`}>Option {o.id}</span>
                  <span className="text-xs text-slate-400">
                    {freeDays} free day{freeDays !== 1 ? "s" : ""}
                  </span>
                </span>
                <MiniDayStrip data={data} optionId={o.id} />
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
