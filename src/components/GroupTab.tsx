"use client";

import type { Build, OptionId, TripData } from "@/lib/types";
import { costForBuild, defaultBuild, fmt, partyFromFamily } from "@/lib/pricing";

export default function GroupTab({
  data,
  buildFor,
  anyCustomized,
}: {
  data: TripData;
  buildFor?: (id: OptionId) => Build;
  anyCustomized?: boolean;
}) {
  // Priced on the viewer's picks (falling back to the suggested plan), applied to
  // every family's size — same plan in every cell keeps it apples-to-apples.
  const builds = Object.fromEntries(
    data.dateOptions.map((o) => [o.id, buildFor ? buildFor(o.id) : defaultBuild(data, o.id)])
  );
  const rows = data.families.map((f) => {
    const costs = data.dateOptions.map((o) => costForBuild(data, o.id, builds[o.id], partyFromFamily(f)));
    const min = Math.min(...costs.map((c) => c.total));
    return { family: f, costs, min };
  });
  const groupTotals = data.dateOptions.map((_, i) => rows.reduce((sum, r) => sum + r.costs[i].total, 0));
  const minGroup = Math.min(...groupTotals);

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-white">The whole crew, every option</h2>
      <p className="mt-1 text-sm text-slate-400">
        {anyCustomized
          ? "Priced on YOUR picks above — your flight, hotels, and activities applied to every family's size — so these match your cards and stay comparable."
          : "Priced on the suggested plan (cheapest flight + first hotel + sample activities) so every family's numbers are comparable."}{" "}
        Each family&apos;s cheapest option glows gold.
      </p>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/15 text-left">
              <th className="py-2.5 pr-2 font-semibold text-slate-300">Family</th>
              {data.dateOptions.map((o) => (
                <th key={o.id} className="px-2 py-2.5 text-right font-bold text-amber-200">
                  {o.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ family, costs, min }) => (
              <tr key={family.id} className="border-b border-white/5">
                <td className="py-2.5 pr-2 font-medium text-slate-200">
                  {family.name}
                  <span className="ml-1 text-xs text-slate-500">
                    ({family.adults}A·{family.kids39}k·{family.kids10plus}K)
                  </span>
                </td>
                {costs.map((c) => (
                  <td
                    key={c.option.id}
                    className={`px-2 py-2.5 text-right tabular-nums ${
                      c.total === min
                        ? "rounded-lg bg-amber-300/15 font-bold text-amber-200"
                        : "text-slate-300"
                    }`}
                  >
                    ~{fmt(c.total)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-white/20">
              <td className="py-3 pr-2 font-bold text-white">All {rows.length} families</td>
              {groupTotals.map((t, i) => (
                <td
                  key={data.dateOptions[i].id}
                  className={`px-2 py-3 text-right font-black tabular-nums ${
                    t === minGroup ? "rounded-lg bg-amber-300/20 text-amber-200" : "text-white"
                  }`}
                >
                  ~{fmt(t)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        A = adults · k = kids 3–9 (child ticket pricing) · K = kids 10+ (adult ticket pricing)
      </p>
    </div>
  );
}
