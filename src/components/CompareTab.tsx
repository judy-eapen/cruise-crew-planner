"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { BuildCost } from "@/lib/pricing";
import { fmt } from "@/lib/pricing";
import { shortDate } from "@/lib/dates";
import type { OptionId } from "@/lib/types";

export default function CompareTab({
  costs,
  familyLabel,
  onSelectOption,
}: {
  costs: BuildCost[];
  familyLabel: string;
  onSelectOption: (id: OptionId) => void;
}) {
  const cheapest = Math.min(...costs.map((c) => c.total));
  const mostFun = Math.max(...costs.map((c) => c.activityDays));

  const byDeparture: [string, BuildCost[]][] = [
    ["Fly out Sat, Oct 31", costs.filter((c) => c.option.departDate === "2026-10-31")],
    ["Fly out Sun, Nov 1", costs.filter((c) => c.option.departDate === "2026-11-01")],
  ];

  const chartData = costs.map((c) => ({
    name: `Option ${c.option.id}`,
    Flights: c.flights,
    Hotel: c.hotel,
    Tickets: c.tickets,
  }));

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-white">
        What each option costs <span className="text-amber-300">{familyLabel}</span>
      </h2>
      {byDeparture.map(([label, group]) => (
        <section key={label} className="mt-5">
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {group.map((c) => (
              <button
                key={c.option.id}
                onClick={() => onSelectOption(c.option.id)}
                className={`group cursor-pointer rounded-3xl border p-5 text-left backdrop-blur-md transition hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-xl hover:shadow-fuchsia-900/30 ${
                  c.total === cheapest
                    ? "border-amber-300/60 bg-amber-300/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`rounded-full px-3 py-0.5 text-sm font-bold ${
                      c.total === cheapest ? "bg-amber-300 text-indigo-950" : "bg-white/10 text-amber-100"
                    }`}
                  >
                    Option {c.option.id}
                  </span>
                  <span className="space-x-1 text-lg">
                    {c.total === cheapest && <span title="Cheapest">💰</span>}
                    {c.activityDays === mostFun && <span title="Most activity days">🎢</span>}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-200">
                  {shortDate(c.option.departDate)} → {shortDate(c.option.returnDate)}
                </p>
                <p className="text-xs text-slate-400">
                  {c.quote && c.quote.airline !== "TBD" && <>✈️ {c.quote.airline} · </>}
                  🏨 {c.option.preNights} night{c.option.preNights !== 1 ? "s" : ""} before
                  {c.option.postNights > 0 ? ` + ${c.option.postNights} after` : ""} · {c.activityDays} free day
                  {c.activityDays !== 1 ? "s" : ""}
                </p>
                <p className="mt-4 text-4xl font-black tracking-tight text-white">
                  {c.anyEstimate && <span className="text-slate-500">~</span>}
                  {fmt(c.total)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{fmt(c.perPerson)} per person</p>
                <p className="mt-3 text-xs font-semibold text-amber-300/0 transition group-hover:text-amber-300">
                  Build this trip your way ↓
                </p>
              </button>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Where the money goes · {familyLabel}
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#cbd5e1" }} axisLine={{ stroke: "#475569" }} tickLine={false} />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(v) => fmt(Number(v))}
                contentStyle={{ background: "#171247", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#f1f5f9" }}
                cursor={{ fill: "rgba(255,255,255,0.06)" }}
              />
              <Legend wrapperStyle={{ color: "#e2e8f0" }} />
              <Bar dataKey="Flights" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Hotel" stackId="a" fill="#fbbf24" />
              <Bar dataKey="Tickets" stackId="a" fill="#f472b6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
