"use client";

import type { Build, OptionId, TripData } from "@/lib/types";
import { costForBuild, fmt, type PartySize } from "@/lib/pricing";
import { shortDate } from "@/lib/dates";

export default function PicksCompare({
  data,
  party,
  familyLabel,
  buildFor,
  isCustomized,
  onEdit,
}: {
  data: TripData;
  party: PartySize;
  familyLabel: string;
  buildFor: (id: OptionId) => Build;
  isCustomized: (id: OptionId) => boolean;
  onEdit: (id: OptionId) => void;
}) {
  const rows = data.dateOptions.map((o) => {
    const build = buildFor(o.id);
    const cost = costForBuild(data, o.id, build, party);
    const preHotel = data.hotels.find((h) => h.id === build.preHotelId);
    const postHotel = data.hotels.find((h) => h.id === build.postHotelId);
    const acts = Object.values(build.activities)
      .filter(Boolean)
      .map((id) => data.activities.find((a) => a.id === id)?.name)
      .filter(Boolean) as string[];
    return { o, build, cost, preHotel, postHotel, acts };
  });
  const minTotal = Math.min(...rows.map((r) => r.cost.total));

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-white">
        Your six trips, side by side — <span className="text-amber-300">{familyLabel}</span>
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Each card is YOUR build of that option — the flight, hotels, and activities you picked above. 💰 marks
        your cheapest. Tap “edit” to change a build.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ o, cost, preHotel, postHotel, acts }) => {
          const cheapest = cost.total === minTotal;
          return (
            <div
              key={o.id}
              className={`flex flex-col rounded-3xl border p-4 backdrop-blur-md ${
                cheapest ? "border-emerald-300/50 bg-emerald-400/[0.05]" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white">Option {o.id}</span>
                <span className="text-xs text-slate-400">
                  {shortDate(o.departDate)} → {shortDate(o.returnDate)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isCustomized(o.id) ? "your build" : "suggested plan"} ·{" "}
                {data.slots.filter((s) => s.optionId === o.id && s.slotType === "full").length} free days
              </p>

              <div className="mt-3 space-y-1.5 text-sm">
                <p className="flex justify-between gap-2 text-slate-200">
                  <span>
                    ✈️ {cost.quote ? `${cost.quote.airline} · ${cost.quote.origin}` : "—"}
                  </span>
                  <span className="tabular-nums text-slate-300">{fmt(cost.flights)}</span>
                </p>
                <p className="flex justify-between gap-2 text-slate-200">
                  <span className="min-w-0">
                    {preHotel || postHotel ? (
                      <>
                        {preHotel && (
                          <>
                            {preHotel.type === "airbnb" ? "🏡" : "🏨"} {preHotel.name}
                          </>
                        )}
                        {preHotel && postHotel && postHotel.id !== preHotel.id && <> · </>}
                        {postHotel && (!preHotel || postHotel.id !== preHotel.id) && (
                          <>
                            {postHotel.type === "airbnb" ? "🏡" : "🏨"} {postHotel.name}
                          </>
                        )}
                      </>
                    ) : (
                      "🏨 —"
                    )}
                  </span>
                  <span className="tabular-nums text-slate-300">{fmt(cost.hotel)}</span>
                </p>
                <p className="flex justify-between gap-2 text-slate-200">
                  <span className="min-w-0">🎢 {acts.length ? acts.join(" · ") : "nothing planned"}</span>
                  <span className="tabular-nums text-slate-300">{fmt(cost.tickets)}</span>
                </p>
              </div>

              <div className="mt-auto pt-3">
                <p className={`text-3xl font-black tracking-tight ${cheapest ? "text-emerald-300" : "text-white"}`}>
                  {cheapest && "💰 "}
                  {cost.anyEstimate && <span className="text-slate-500">~</span>}
                  {fmt(cost.total)}
                </p>
                <p className="flex items-baseline justify-between text-xs text-slate-400">
                  <span>{fmt(cost.perPerson)}/person</span>
                  <button onClick={() => onEdit(o.id)} className="font-semibold text-cyan-300 hover:text-cyan-200">
                    edit this build ↑
                  </button>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
