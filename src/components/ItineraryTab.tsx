"use client";

import { useState } from "react";
import type { OptionId, Origin, TripData } from "@/lib/types";
import { costForOption, fmt, type PartySize } from "@/lib/pricing";
import { isoRange, shortDate, shortDay } from "@/lib/dates";

const CRUISE_DAYS = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"];

export default function ItineraryTab({
  data,
  origin,
  airlinePref,
  hotelId,
  party,
  familyLabel,
  optionId,
  onSelectOption,
}: {
  data: TripData;
  origin: Origin;
  airlinePref: string;
  hotelId: string;
  party: PartySize;
  familyLabel: string;
  optionId: OptionId;
  onSelectOption: (id: OptionId) => void;
}) {
  const [copied, setCopied] = useState(false);

  const option = data.dateOptions.find((o) => o.id === optionId)!;
  const slots = data.slots.filter((s) => s.optionId === optionId);
  const cost = costForOption(data, optionId, origin, hotelId, party, airlinePref);
  const days = isoRange(option.departDate, option.returnDate);

  const dayInfo = (iso: string) => {
    const slot = slots.find((s) => s.date === iso);
    if (slot) return slot;
    if (CRUISE_DAYS.includes(iso) || iso === "2026-11-06")
      return { date: iso, dayLabel: "Cruise", slotType: "cruise" as const, activityId: null };
    return { date: iso, dayLabel: "", slotType: "travel" as const, activityId: null };
  };

  const chipStyle = (t: string) =>
    t === "cruise"
      ? "bg-gradient-to-b from-indigo-500 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/40"
      : t === "travel"
        ? "bg-white/10 text-slate-300"
        : t === "full"
          ? "bg-amber-300 text-indigo-950 shadow-lg shadow-amber-900/30"
          : "bg-amber-200/30 text-amber-100 border border-amber-200/40";

  const copySummary = async () => {
    const lines = [
      `✨ Option ${option.id} — ${option.label}`,
      `Fly ${shortDate(option.departDate)} → ${shortDate(option.returnDate)} from ${origin}${cost.airline !== "TBD" ? ` on ${cost.airline}` : ""} · ${option.hotelNights} hotel nights (${(data.hotels.find((h) => h.id === hotelId) ?? data.hotels[0]).name})`,
      ...slots
        .filter((s) => s.activityId)
        .map((s) => {
          const a = data.activities.find((x) => x.id === s.activityId)!;
          return `• ${shortDate(s.date)} (${s.dayLabel}): ${a.name}`;
        }),
      `• Nov 2–6: 🚢 the cruise!`,
      `${familyLabel} total: ${cost.anyEstimate ? "~" : ""}${fmt(cost.total)} (flights ${fmt(cost.flights)} + hotel ${fmt(cost.hotel)} + tickets ${fmt(cost.tickets)})`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {data.dateOptions.map((o) => (
          <button
            key={o.id}
            onClick={() => onSelectOption(o.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              o.id === optionId
                ? "bg-amber-300 text-indigo-950 shadow-lg shadow-amber-900/30"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            {o.id}
          </button>
        ))}
        <span className="text-sm font-medium text-slate-300">{option.label}</span>
      </div>

      {/* Day strip */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {days.map((iso) => {
          const info = dayInfo(iso);
          return (
            <div
              key={iso}
              className={`flex min-w-[4.5rem] flex-col items-center rounded-2xl px-2 py-2.5 text-center ${chipStyle(info.slotType)}`}
            >
              <span className="text-[10px] font-bold uppercase opacity-75">{shortDay(iso)}</span>
              <span className="text-sm font-extrabold">{shortDate(iso)}</span>
              <span className="mt-1 text-lg">
                {info.slotType === "cruise" ? "🚢" : info.slotType === "travel" ? "✈️" : info.slotType === "full" ? "🎢" : "🌤"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">✈️ travel · 🚢 cruise (fixed) · 🎢 full activity day · 🌤 half day</p>

      {/* Day cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slots
          .filter((s) => s.activityId)
          .map((s) => {
            const a = data.activities.find((x) => x.id === s.activityId)!;
            const free = a.adultPrice + a.childPrice === 0;
            return (
              <div
                key={s.date}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-fuchsia-900/30"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {shortDate(s.date)} · {s.dayLabel} · {a.type === "full" ? "Full day" : "Half day"}
                </p>
                <p className="mt-1.5 text-lg font-bold text-white">
                  {a.star ? "⭐ " : ""}
                  {a.name}
                </p>
                <p className="mt-0.5 text-sm text-amber-200">
                  {free ? "Free! ✨" : `${a.estimate ? "~" : ""}$${a.adultPrice} adult / $${a.childPrice} kid (3–9)`}
                </p>
                {a.note && <p className="mt-1.5 text-xs text-slate-400">{a.note}</p>}
              </div>
            );
          })}
      </div>

      {/* Cost breakdown */}
      <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-300">
          {familyLabel} · Option {option.id} total:{" "}
          <span className="text-2xl font-black text-white">
            {cost.anyEstimate && "~"}
            {fmt(cost.total)}
          </span>
        </h3>
        <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-white/10">
          <div className="bg-indigo-400" style={{ width: `${(cost.flights / cost.total) * 100}%` }} title="Flights" />
          <div className="bg-amber-400" style={{ width: `${(cost.hotel / cost.total) * 100}%` }} title="Hotel" />
          <div className="bg-pink-400" style={{ width: `${(cost.tickets / cost.total) * 100}%` }} title="Tickets" />
        </div>
        <p className="mt-2 text-xs text-slate-300">
          <span className="font-semibold text-indigo-300">Flights {fmt(cost.flights)}</span> ·{" "}
          <span className="font-semibold text-amber-300">Hotel {fmt(cost.hotel)}</span> ·{" "}
          <span className="font-semibold text-pink-300">Tickets {fmt(cost.tickets)}</span>
        </p>
        <button
          onClick={copySummary}
          className="mt-4 rounded-full bg-amber-300 px-5 py-2 text-sm font-bold text-indigo-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-200"
        >
          {copied ? "Copied! ✨" : "Copy summary for the group chat"}
        </button>
      </section>
    </div>
  );
}
