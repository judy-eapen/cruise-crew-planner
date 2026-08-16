"use client";

import { useMemo, useState } from "react";
import type { Activity, Build, Hotel, OptionId, TripData } from "@/lib/types";
import {
  costForBuild,
  fmt,
  hotelSegmentCost,
  hotelsForSegment,
  segmentStay,
  quoteCostForParty,
  quotesForOption,
  totalPeople,
  type PartySize,
} from "@/lib/pricing";
import { isoRange, shortDate, shortDay } from "@/lib/dates";

const CRUISE_DAYS = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"];

const AGE_LABEL: Record<string, string> = {
  all: "All ages",
  younger: "Best 3–9",
  older: "Best 10+",
  check: "Check restrictions",
};
const AREA_LABEL: Record<string, string> = {
  orlando: "Orlando",
  port: "Near port",
  daytrip: "Day trip",
};

export default function BuilderSection({
  data,
  party,
  familyLabel,
  optionId,
  onSelectOption,
  build,
  onUpdateBuild,
  onReset,
  isCustomized,
}: {
  data: TripData;
  party: PartySize;
  familyLabel: string;
  optionId: OptionId;
  onSelectOption: (id: OptionId) => void;
  build: Build;
  onUpdateBuild: (b: Build) => void;
  onReset: () => void;
  isCustomized: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "full" | "half">("all");
  const [filterCost, setFilterCost] = useState<"all" | "free" | "paid">("all");
  const [filterAge, setFilterAge] = useState<"all" | "younger" | "older">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const option = data.dateOptions.find((o) => o.id === optionId)!;
  const slots = data.slots.filter((s) => s.optionId === optionId);
  const freeSlots = slots.filter((s) => s.slotType !== "travel");
  const quotes = quotesForOption(data, optionId);
  const cost = costForBuild(data, optionId, build, party);
  const days = isoRange(option.departDate, option.returnDate);
  const people = totalPeople(party);

  const ticketCost = (a: Activity) =>
    a.adultPrice * (party.adults + party.kids10plus) + a.childPrice * party.kids39;

  const tableActivities = useMemo(() => {
    let list = data.activities.slice();
    if (filterType !== "all") list = list.filter((a) => a.type === filterType);
    if (filterCost === "free") list = list.filter((a) => a.adultPrice + a.childPrice === 0);
    if (filterCost === "paid") list = list.filter((a) => a.adultPrice + a.childPrice > 0);
    if (filterAge !== "all") list = list.filter((a) => a.ageFit === filterAge || a.ageFit === "all");
    list.sort((a, b) => (sortDir === "asc" ? ticketCost(a) - ticketCost(b) : ticketCost(b) - ticketCost(a)));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterType, filterCost, filterAge, sortDir, party]);

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

  const segDates = {
    pre: option.preNights > 0 ? `${shortDate(option.departDate)} → Nov 2 · ${option.preNights} night${option.preNights > 1 ? "s" : ""}` : null,
    post: option.postNights > 0 ? `Nov 6 → ${shortDate(option.returnDate)} · ${option.postNights} night${option.postNights > 1 ? "s" : ""}` : null,
  };

  const hotelCard = (h: Hotel, segment: "pre" | "post", nights: number) => {
    const selected = (segment === "pre" ? build.preHotelId : build.postHotelId) === h.id;
    const segCost = hotelSegmentCost(h, segment, nights, party);
    const stay = segmentStay(h, segment, nights);
    const rateText = stay ? `${stay.label}: ${fmt(stay.total)}` : "";
    return (
      <button
        key={`${segment}-${h.id}`}
        onClick={() =>
          onUpdateBuild(segment === "pre" ? { ...build, preHotelId: h.id } : { ...build, postHotelId: h.id })
        }
        className={`rounded-2xl border p-4 text-left transition ${
          selected ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/5 hover:border-white/30"
        }`}
      >
        <p className={`font-bold ${selected ? "text-amber-200" : "text-white"}`}>
          {h.type === "airbnb" ? "🏡" : "🏨"} {h.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {"⭐".repeat(h.stars)} · {h.area}
          {h.pool && " · 🏊 pool"}
          {h.breakfastIncluded && " · 🍳 breakfast"}
        </p>
        {h.amenities && <p className="mt-0.5 text-xs text-slate-500">{h.amenities}</p>}
        {h.link && (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              window.open(h.link, "_blank", "noopener");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                window.open(h.link, "_blank", "noopener");
              }
            }}
            className="mt-1 inline-block text-xs font-semibold text-cyan-300 underline decoration-cyan-300/50 hover:text-cyan-200"
          >
            View hotel ↗
          </span>
        )}
        <p className="mt-1.5 text-sm text-amber-200">
          {h.estimate && "~"}
          {rateText}
          {h.priceMode === "per_property_night_split" ? ` whole place, split ${h.sharedFamilies} ways` : "/room for the stay"}{" "}
          → <span className="font-bold">{fmt(segCost)}</span> for {familyLabel}
        </p>
      </button>
    );
  };

  const copySummary = async () => {
    const actLines = freeSlots
      .filter((s) => build.activities[s.date])
      .map((s) => {
        const a = data.activities.find((x) => x.id === build.activities[s.date]);
        return a ? `• ${shortDate(s.date)} (${s.dayLabel}): ${a.name}` : "";
      })
      .filter(Boolean);
    const preH = data.hotels.find((h) => h.id === build.preHotelId);
    const postH = data.hotels.find((h) => h.id === build.postHotelId);
    const lines = [
      `✨ Option ${option.id} — ${option.label}`,
      cost.quote
        ? `Flights: ${cost.quote.origin} → MCO on ${cost.quote.airline} (out ${cost.quote.outDepart}→${cost.quote.outArrive} / back ${cost.quote.retDepart}→${cost.quote.retArrive}) · ${fmt(cost.quote.farePerPerson)}/person${cost.quote.bagFee ? ` + ${fmt(cost.quote.bagFee)}/bag` : ""}`
        : "Flights: TBD",
      preH && segDates.pre ? `Hotel before cruise (${segDates.pre}): ${preH.name}` : "",
      postH && segDates.post ? `Hotel after cruise (${segDates.post}): ${postH.name}` : "",
      ...actLines,
      `• Nov 2–6: 🚢 the cruise!`,
      `${familyLabel} total: ${cost.anyEstimate ? "~" : ""}${fmt(cost.total)} (flights ${fmt(cost.flights)} + hotels ${fmt(cost.hotel)} + tickets ${fmt(cost.tickets)})`,
    ].filter(Boolean);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selCls = "rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-white [&>option]:text-slate-900";

  return (
    <div>
      {/* Option chips */}
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
        {isCustomized && (
          <button onClick={onReset} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-pink-300 hover:bg-white/20">
            ↺ Reset to suggested plan
          </button>
        )}
      </div>

      {/* Day strip */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {days.map((iso) => {
          const info = dayInfo(iso);
          return (
            <div key={iso} className={`flex min-w-[4.5rem] flex-col items-center rounded-2xl px-2 py-2.5 text-center ${chipStyle(info.slotType)}`}>
              <span className="text-[10px] font-bold uppercase opacity-75">{shortDay(iso)}</span>
              <span className="text-sm font-extrabold">{shortDate(iso)}</span>
              <span className="mt-1 text-lg">
                {info.slotType === "cruise" ? "🚢" : info.slotType === "travel" ? "✈️" : info.slotType === "full" ? "🎢" : "🌤"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">✈️ travel · 🚢 cruise (fixed) · 🎢 full free day · 🌤 half free day</p>

      {/* 1 · Flights */}
      <h3 className="font-display mt-8 text-xl tracking-wide text-white">1 · Pick your flight</h3>
      <p className="text-xs text-slate-400">
        Nonstop flights only · sorted by what {familyLabel} would pay ({people} people, {party.bags} checked bag{party.bags !== 1 ? "s" : ""}).
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {quotes
          .slice()
          .sort((a, b) => quoteCostForParty(a, party) - quoteCostForParty(b, party))
          .map((q) => {
            const selected = (cost.quote?.id ?? null) === q.id;
            const familyFlightCost = quoteCostForParty(q, party);
            return (
              <button
                key={q.id}
                onClick={() => onUpdateBuild({ ...build, flightId: q.id })}
                className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border p-3.5 text-left transition ${
                  selected ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <span className={`font-bold ${selected ? "text-amber-200" : "text-white"}`}>
                  ✈️ {q.origin} → MCO · {q.airline}
                </span>
                <span className="text-xs text-slate-400">
                  out {q.outDepart} → {q.outArrive} · back {q.retDepart} → {q.retArrive} · {q.duration}
                </span>
                <span className="text-sm text-slate-300">
                  {q.estimate && "~"}
                  {fmt(q.farePerPerson)}/person
                  {q.bagFee > 0 ? ` + ${fmt(q.bagFee)}/bag` : " · bags included"}
                </span>
                <span className="ml-auto text-sm font-bold text-amber-200">{fmt(familyFlightCost)} for {familyLabel}</span>
              </button>
            );
          })}
      </div>

      {/* 2 · Hotels, two segments */}
      <h3 className="font-display mt-8 text-xl tracking-wide text-white">2 · Pick your hotels</h3>
      {segDates.pre && (
        <>
          <p className="mt-2 text-sm font-semibold text-slate-300">🌙 Before the cruise · {segDates.pre}</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {hotelsForSegment(data.hotels, "pre", option.preNights).map((h) => hotelCard(h, "pre", option.preNights))}
          </div>
        </>
      )}
      {segDates.post && (
        <>
          <p className="mt-4 text-sm font-semibold text-slate-300">🌅 After the cruise · {segDates.post}</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {hotelsForSegment(data.hotels, "post", option.postNights).map((h) => hotelCard(h, "post", option.postNights))}
          </div>
        </>
      )}
      {!segDates.pre && !segDates.post && <p className="mt-2 text-sm text-slate-400">No hotel nights for this option.</p>}

      {/* 3 · Activities per free day */}
      <h3 className="font-display mt-8 text-xl tracking-wide text-white">3 · Fill your free days</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {freeSlots.map((s) => {
          const eligible = data.activities
            .filter((a) => (s.slotType === "half" ? a.type === "half" : true))
            .sort((a, b) => ticketCost(a) - ticketCost(b));
          const chosen = data.activities.find((a) => a.id === build.activities[s.date]);
          return (
            <div key={s.date} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {shortDate(s.date)} · {s.dayLabel} · {s.slotType === "full" ? "Full day" : "Half day"}
              </p>
              <select
                value={build.activities[s.date] ?? ""}
                onChange={(e) =>
                  onUpdateBuild({ ...build, activities: { ...build.activities, [s.date]: e.target.value || null } })
                }
                className={`${selCls} mt-2 w-full`}
              >
                <option value="">— rest / nothing planned —</option>
                {eligible.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.star ? "⭐ " : ""}
                    {a.name} {ticketCost(a) > 0 ? `(${fmt(ticketCost(a))})` : "(free)"}
                  </option>
                ))}
              </select>
              {chosen && (
                <p className="mt-1.5 text-xs text-slate-400">
                  {AGE_LABEL[chosen.ageFit]} · {AREA_LABEL[chosen.area]}
                  {chosen.note ? ` · ${chosen.note}` : ""}
                </p>
              )}
            </div>
          );
        })}
        {freeSlots.length === 0 && <p className="text-sm text-slate-400">No free days on this option — it&apos;s all cruise and travel.</p>}
      </div>

      {/* Activity browser */}
      <details className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-300">
          📋 Browse all {data.activities.length} activities (filter & sort)
        </summary>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as never)} className={selCls}>
            <option value="all">Full + half day</option>
            <option value="full">Full day only</option>
            <option value="half">Half day only</option>
          </select>
          <select value={filterCost} onChange={(e) => setFilterCost(e.target.value as never)} className={selCls}>
            <option value="all">Paid + free</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>
          <select value={filterAge} onChange={(e) => setFilterAge(e.target.value as never)} className={selCls}>
            <option value="all">Any age fit</option>
            <option value="younger">Good for 3–9</option>
            <option value="older">Good for 10+</option>
          </select>
          <button onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")} className="rounded-lg bg-white/10 px-2 py-1 font-semibold text-slate-200 hover:bg-white/20">
            Cost {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/15 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Activity</th>
                <th>Type</th>
                <th>Ages</th>
                <th>Where</th>
                <th className="text-right">Adult</th>
                <th className="text-right">Kid 3–9</th>
                <th className="text-right">{familyLabel}</th>
              </tr>
            </thead>
            <tbody>
              {tableActivities.map((a) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-2 text-slate-100">
                    {a.star ? "⭐ " : ""}
                    {a.name}
                    {a.note && <span className="block text-xs text-slate-500">{a.note}</span>}
                  </td>
                  <td className="text-slate-300">{a.type === "full" ? "Full" : "Half"}</td>
                  <td className="text-slate-300">{AGE_LABEL[a.ageFit]}</td>
                  <td className="text-slate-300">{AREA_LABEL[a.area]}</td>
                  <td className="text-right tabular-nums text-slate-300">{a.adultPrice ? `${a.estimate ? "~" : ""}$${a.adultPrice}` : "Free"}</td>
                  <td className="text-right tabular-nums text-slate-300">{a.childPrice ? `${a.estimate ? "~" : ""}$${a.childPrice}` : "Free"}</td>
                  <td className="text-right font-semibold tabular-nums text-amber-200">{ticketCost(a) ? fmt(ticketCost(a)) : "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Total */}
      <section className="mt-8 rounded-3xl border border-amber-300/30 bg-amber-300/5 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-300">
          {familyLabel} · Option {option.id}
          {isCustomized ? " (your build)" : " (suggested plan)"} :{" "}
          <span className="text-2xl font-black text-white">
            {cost.anyEstimate && "~"}
            {fmt(cost.total)}
          </span>
        </h3>
        <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-white/10">
          <div className="bg-indigo-400" style={{ width: `${(cost.flights / Math.max(1, cost.total)) * 100}%` }} title="Flights" />
          <div className="bg-amber-400" style={{ width: `${(cost.hotel / Math.max(1, cost.total)) * 100}%` }} title="Hotels" />
          <div className="bg-pink-400" style={{ width: `${(cost.tickets / Math.max(1, cost.total)) * 100}%` }} title="Tickets" />
        </div>
        <p className="mt-2 text-xs text-slate-300">
          <span className="font-semibold text-indigo-300">
            Flights {fmt(cost.flights)}
            {cost.bagsCost > 0 && ` (incl. ${fmt(cost.bagsCost)} bags)`}
          </span>{" "}
          · <span className="font-semibold text-amber-300">Hotels {fmt(cost.hotel)}</span> ·{" "}
          <span className="font-semibold text-pink-300">Tickets {fmt(cost.tickets)}</span> · {fmt(cost.perPerson)}/person
        </p>
        <button onClick={copySummary} className="mt-4 rounded-full bg-amber-300 px-5 py-2 text-sm font-bold text-indigo-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-200">
          {copied ? "Copied! ✨" : "Copy this plan for the group chat"}
        </button>
      </section>
    </div>
  );
}
