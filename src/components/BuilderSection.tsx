"use client";

import { useMemo, useState } from "react";
import type { Activity, Build, Hotel, OptionId, TripData } from "@/lib/types";
import {
  activityCostForParty,
  costForBuild,
  fmt,
  hotelSegmentCost,
  hotelsForSegment,
  segmentStay,
  type PartySize,
} from "@/lib/pricing";
import { googleFlightsUrl, isoRange, shortDate, shortDay } from "@/lib/dates";
import { parkForActivity, type ParkId } from "@/data/rides";

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
  onOpenRideGuide,
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
  onOpenRideGuide?: (park: ParkId) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "full" | "half">("all");
  const [filterCost, setFilterCost] = useState<"all" | "free" | "paid">("all");
  const [filterAge, setFilterAge] = useState<"all" | "younger" | "older">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showAllActivities, setShowAllActivities] = useState(false);
  // Guided flow: after hotels are picked glide to activities; after the last free
  // day is filled glide to the total. Tracks clicks this visit, per option.
  const [pickedSegs, setPickedSegs] = useState<("pre" | "post")[]>([]);
  const [touchedDays, setTouchedDays] = useState<string[]>([]);
  const [flowOption, setFlowOption] = useState(optionId);
  if (flowOption !== optionId) {
    // Reset the guided-flow progress when the option changes (state-during-render pattern).
    setFlowOption(optionId);
    setPickedSegs([]);
    setTouchedDays([]);
  }
  const glideTo = (id: string) =>
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);

  const option = data.dateOptions.find((o) => o.id === optionId)!;
  const slots = data.slots.filter((s) => s.optionId === optionId);
  const freeSlots = slots.filter((s) => s.slotType !== "travel");
  const cost = costForBuild(data, optionId, build, party);
  const days = isoRange(option.departDate, option.returnDate);

  const ticketCost = (a: Activity, date?: string) => activityCostForParty(a, party, date);

  const tableActivities = useMemo(() => {
    let list = data.activities.slice();
    if (!showAllActivities) list = list.filter((a) => a.star);
    if (filterType !== "all") list = list.filter((a) => a.type === filterType);
    if (filterCost === "free") list = list.filter((a) => a.adultPrice + a.childPrice === 0);
    if (filterCost === "paid") list = list.filter((a) => a.adultPrice + a.childPrice > 0);
    if (filterAge !== "all") list = list.filter((a) => a.ageFit === filterAge || a.ageFit === "all");
    list.sort((a, b) => (sortDir === "asc" ? ticketCost(a) - ticketCost(b) : ticketCost(b) - ticketCost(a)));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterType, filterCost, filterAge, sortDir, party, showAllActivities]);

  // Strip iconography reads as the journey: fly days show the plane, boarding
  // day (Nov 2) joins the cruise block, everything else follows its slot.
  const dayInfo = (iso: string) => {
    if (iso === option.departDate || iso === option.returnDate)
      return { date: iso, dayLabel: "Fly", slotType: "travel" as const, activityId: null };
    if (CRUISE_DAYS.includes(iso))
      return { date: iso, dayLabel: "Cruise", slotType: "cruise" as const, activityId: null };
    const slot = slots.find((s) => s.date === iso);
    if (slot) return slot;
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

  // Flight-quote-style row: two scannable lines; the selected stay expands with full detail.
  const stayRow = (h: Hotel, segment: "pre" | "post", nights: number, minCost: number) => {
    const selected = (segment === "pre" ? build.preHotelId : build.postHotelId) === h.id;
    const segCost = hotelSegmentCost(h, segment, nights, party);
    const isCheapest = segCost === minCost;
    const stay = segmentStay(h, segment, nights);
    const openLink = (e: React.SyntheticEvent) => {
      e.stopPropagation();
      window.open(h.link, "_blank", "noopener");
    };
    return (
      <button
        key={`${segment}-${h.id}`}
        onClick={() => {
          onUpdateBuild(segment === "pre" ? { ...build, preHotelId: h.id } : { ...build, postHotelId: h.id });
          const segs = pickedSegs.includes(segment) ? pickedSegs : [...pickedSegs, segment];
          setPickedSegs(segs);
          const needed: ("pre" | "post")[] = [
            ...(option.preNights > 0 ? (["pre"] as const) : []),
            ...(option.postNights > 0 ? (["post"] as const) : []),
          ];
          if (needed.every((seg) => segs.includes(seg))) glideTo("pick-activities");
        }}
        className={`w-full px-4 py-2.5 text-left transition ${selected ? "bg-amber-300/10" : "hover:bg-white/5"}`}
      >
        <span className="flex items-baseline justify-between gap-2">
          <span className={`text-sm font-semibold ${selected ? "text-amber-200" : "text-slate-100"}`}>
            🏨 {h.name}
            {selected && " ✓"}
          </span>
          <span className={`shrink-0 text-sm font-bold tabular-nums ${isCheapest ? "text-emerald-300" : "text-slate-200"}`}>
            {isCheapest && "💰 "}
            {h.estimate && "~"}
            {fmt(segCost)}
            {!isCheapest && (
              <span className="ml-1 text-[11px] font-normal text-slate-500">(+{fmt(segCost - minCost)})</span>
            )}
          </span>
        </span>
        <span className="mt-0.5 block text-[11px] text-slate-400">
          {"⭐".repeat(h.stars)} · {h.area}
          {h.pool && " · 🏊"}
          {h.breakfastIncluded && " · 🍳"}
          {h.priceMode === "per_property_night_split" && ` · split ${h.sharedFamilies} ways`}
        </span>
        {selected && (
          <span className="mt-2 block rounded-xl bg-white/5 px-3 py-2 text-xs">
            {(h.sleeps > 0 || h.bedrooms > 0) && (
              <span className="block text-slate-300">
                {h.bedrooms > 0 && `🛏 ${h.bedrooms} BR`}
                {h.beds > 0 && ` · ${h.beds} beds`}
                {h.baths > 0 && ` · 🛁 ${h.baths} bath${h.baths !== 1 ? "s" : ""}`}
                {h.sleeps > 0 && ` · sleeps ${h.sleeps}`}
                {h.priceMode === "per_property_night_split" && h.sleeps > 0 && h.sleeps < h.sharedFamilies * 4 && (
                  <span className="text-pink-300"> · ⚠ tight for {h.sharedFamilies} families (~{h.sharedFamilies * 4} people)</span>
                )}
              </span>
            )}
            {h.cancellation && <span className="block text-emerald-300">↩ {h.cancellation}</span>}
            {h.amenities && <span className="block text-slate-500">{h.amenities}</span>}
            <span className="mt-0.5 block tabular-nums text-amber-100">
              {h.estimate && "~"}
              {stay ? `${stay.label}: ${fmt(stay.total)}` : ""}
              {h.priceMode === "per_property_night_split" ? ` whole place ÷ ${h.sharedFamilies} families` : "/room for the stay"} ={" "}
              <span className="font-bold">{fmt(segCost)}</span> for {familyLabel}
            </span>
            {h.link && (
              <span
                role="link"
                tabIndex={0}
                onClick={openLink}
                onKeyDown={(e) => e.key === "Enter" && openLink(e)}
                className="mt-1 inline-block font-semibold text-cyan-300 underline decoration-cyan-300/50 hover:text-cyan-200"
              >
                View hotel ↗
              </span>
            )}
          </span>
        )}
      </button>
    );
  };

  // One ranked list per segment — hotels and Airbnbs together, cheapest first.
  const segmentBlock = (segment: "pre" | "post", nights: number, header: string) => {
    const costOf = (h: Hotel) => hotelSegmentCost(h, segment, nights, party);
    const list = hotelsForSegment(data.hotels, segment, nights).sort((a, b) => costOf(a) - costOf(b));
    if (!list.length) return null;
    const minCost = costOf(list[0]);
    return (
      <div>
        <p className="text-sm font-semibold text-slate-300">{header}</p>
        <div className="mt-2 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {list.map((h) => stayRow(h, segment, nights, minCost))}
        </div>
      </div>
    );
  };

  const copySummary = async () => {
    const actLines = freeSlots
      .filter((s) => build.activities[s.date])
      .map((s) => {
        const a = data.activities.find((x) => x.id === build.activities[s.date]);
        const a2 = data.activities.find((x) => x.id === build.activities2?.[s.date]);
        return a ? `• ${shortDate(s.date)} (${s.dayLabel}): ${a.name}${a2 ? ` + ${a2.name}` : ""}` : "";
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

      {/* Selected flight (picked in the glance grid above) */}
      <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
        ✈️ Your flight:{" "}
        {cost.quote ? (
          <>
            <span className="font-bold text-amber-200">
              {cost.quote.airline} · {cost.quote.origin} → MCO
            </span>{" "}
            · out {cost.quote.outDepart} → {cost.quote.outArrive} · back {cost.quote.retDepart} → {cost.quote.retArrive} ·{" "}
            <span className="font-bold text-white">{fmt(cost.flights)}</span> for {familyLabel} ·{" "}
            <a
              href={googleFlightsUrl(cost.quote.origin, option.departDate, option.returnDate)}
              target="_blank"
              rel="noopener noreferrer"
              title="Opens Google Flights with these airports and dates — pick this flight there to book"
              className="font-semibold text-cyan-300 underline decoration-cyan-300/50 hover:text-cyan-200"
            >
              Book ↗
            </a>
          </>
        ) : (
          "none yet"
        )}{" "}
        <span className="text-xs text-slate-500">— change it in the grid above</span>
      </p>

      {/* 1 · Hotels, two segments */}
      <h3 id="pick-hotels" className="font-display mt-8 scroll-mt-40 text-xl tracking-wide text-white">1 · Pick your hotels</h3>
      {(segDates.pre || segDates.post) && (
        <p className="mt-1.5 text-xs text-slate-400">
          Cheapest first · prices are what <span className="font-semibold text-amber-200">{familyLabel}</span> pays for the
          stay · 💰 = cheapest · tap a stay to pick it
        </p>
      )}
      {(segDates.pre || segDates.post) && (
        <div className="mt-4 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {segDates.pre && segmentBlock("pre", option.preNights, `🌙 Before the cruise · ${segDates.pre}`)}
          {segDates.post && segmentBlock("post", option.postNights, `🌅 After the cruise · ${segDates.post}`)}
        </div>
      )}
      {!segDates.pre && !segDates.post && <p className="mt-2 text-sm text-slate-400">No hotel nights for this option.</p>}

      {/* 3 · Activities per free day */}
      <h3 id="pick-activities" className="font-display mt-8 scroll-mt-40 text-xl tracking-wide text-white">2 · Fill your free days</h3>
      {onOpenRideGuide && (
        <p className="mt-1.5 text-sm text-slate-400">
          Eyeing a theme park? Check the{" "}
          <button
            onClick={() => onOpenRideGuide("usf")}
            className="font-semibold text-emerald-300 underline decoration-emerald-300/50 hover:text-emerald-200"
          >
            🎢 ride guide
          </button>{" "}
          first — pick your kid&apos;s height, see exactly what they can ride.
        </p>
      )}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {freeSlots.map((s) => {
          const eligible = data.activities
            .filter((a) => (s.slotType === "half" ? a.type === "half" : true))
            .sort((a, b) => ticketCost(a, s.date) - ticketCost(b, s.date));
          const topPicks = eligible.filter((a) => a.star);
          const moreIdeas = eligible.filter((a) => !a.star);
          const optionFor = (a: Activity) => (
            <option key={a.id} value={a.id}>
              {a.star ? "⭐ " : ""}
              {a.name} {ticketCost(a, s.date) > 0 ? `(${fmt(ticketCost(a, s.date))})` : "(free)"}
            </option>
          );
          const chosen = data.activities.find((a) => a.id === build.activities[s.date]);
          const chosen2 = data.activities.find((a) => a.id === build.activities2?.[s.date]);
          const ridePark = parkForActivity(chosen?.id) ?? parkForActivity(chosen2?.id);
          return (
            <div key={s.date} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {shortDate(s.date)} · {s.dayLabel} · {s.slotType === "full" ? "Full day" : "Half day"}
              </p>
              <select
                value={build.activities[s.date] ?? ""}
                onChange={(e) => {
                  const v = e.target.value || null;
                  const picked = data.activities.find((a) => a.id === v);
                  const next: Build = { ...build, activities: { ...build.activities, [s.date]: v } };
                  // The second (half-day) pick only makes sense alongside a half-day first pick.
                  if (!picked || picked.type !== "half")
                    next.activities2 = { ...(build.activities2 ?? {}), [s.date]: null };
                  onUpdateBuild(next);
                  const days = touchedDays.includes(s.date) ? touchedDays : [...touchedDays, s.date];
                  setTouchedDays(days);
                  if (days.length >= freeSlots.length) glideTo("your-total");
                }}
                className={`${selCls} mt-2 w-full`}
              >
                <option value="">— rest / nothing planned —</option>
                {topPicks.length > 0 ? (
                  <>
                    <optgroup label="⭐ Top picks">{topPicks.map(optionFor)}</optgroup>
                    {moreIdeas.length > 0 && <optgroup label="More ideas">{moreIdeas.map(optionFor)}</optgroup>}
                  </>
                ) : (
                  eligible.map(optionFor)
                )}
              </select>
              {s.slotType === "half" && (
                <p className="mt-1.5 text-[11px] text-slate-500">
                  ⏱ Half-day options only — not enough hours for a full-day park on this day
                </p>
              )}
              {s.slotType === "full" && chosen?.type === "half" && (
                <select
                  value={build.activities2?.[s.date] ?? ""}
                  onChange={(e) =>
                    onUpdateBuild({
                      ...build,
                      activities2: { ...(build.activities2 ?? {}), [s.date]: e.target.value || null },
                    })
                  }
                  className={`${selCls} mt-1.5 w-full`}
                >
                  <option value="">+ add a second half-day activity (optional)</option>
                  {eligible
                    .filter((a) => a.type === "half" && a.id !== chosen.id)
                    .map(optionFor)}
                </select>
              )}
              {chosen2 && s.slotType === "full" && chosen?.type === "half" && (
                <p className="mt-1 text-xs text-slate-400">
                  2nd: {AGE_LABEL[chosen2.ageFit]} · {AREA_LABEL[chosen2.area]}
                  {chosen2.ticketLink && (
                    <>
                      {" · "}
                      <a
                        href={chosen2.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-cyan-300 underline decoration-cyan-300/50 hover:text-cyan-200"
                      >
                        Tickets ↗
                      </a>
                    </>
                  )}
                </p>
              )}
              {chosen && (chosen.ageNotesYounger || chosen.ageNotesOlder) && (
                <span className="mt-1.5 block rounded-lg bg-white/5 px-2.5 py-1.5 text-xs">
                  {chosen.ageNotesYounger && (
                    <span className="block text-slate-300">
                      <span className="font-semibold text-amber-200">👧 3–9:</span> {chosen.ageNotesYounger}
                    </span>
                  )}
                  {chosen.ageNotesOlder && (
                    <span className="block text-slate-300">
                      <span className="font-semibold text-amber-200">🧑 10+:</span> {chosen.ageNotesOlder}
                    </span>
                  )}
                </span>
              )}
              {chosen && (
                <p className="mt-1.5 text-xs text-slate-400">
                  {AGE_LABEL[chosen.ageFit]} · {AREA_LABEL[chosen.area]}
                  {chosen.note ? ` · ${chosen.note}` : ""}
                  {chosen.ticketLink && (
                    <>
                      {" · "}
                      <a
                        href={chosen.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-cyan-300 underline decoration-cyan-300/50 hover:text-cyan-200"
                      >
                        Tickets ↗
                      </a>
                    </>
                  )}
                </p>
              )}
              {ridePark && onOpenRideGuide && (
                <button
                  onClick={() => onOpenRideGuide(ridePark.id)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                >
                  🎢 Who can ride what at {ridePark.short}? →
                </button>
              )}
            </div>
          );
        })}
        {freeSlots.length === 0 && <p className="text-sm text-slate-400">No free days on this option — it&apos;s all cruise and travel.</p>}
      </div>

      {/* Activity browser */}
      <details className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-300">
          📋 Browse activities — ⭐ top picks first (filter & sort)
        </summary>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowAllActivities(!showAllActivities)}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              showAllActivities ? "bg-white/10 text-slate-200 hover:bg-white/20" : "bg-amber-300 text-indigo-950"
            }`}
          >
            {showAllActivities
              ? `Showing all ${data.activities.length} — back to ⭐ top picks`
              : `⭐ Top picks · show all ${data.activities.length}`}
          </button>
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
                    {a.ticketLink && (
                      <a
                        href={a.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-2 text-xs font-semibold text-cyan-300 underline decoration-cyan-300/50 hover:text-cyan-200"
                      >
                        Tickets ↗
                      </a>
                    )}
                    {a.note && <span className="block text-xs text-slate-500">{a.note}</span>}
                    {a.ageNotesYounger && (
                      <span className="block text-xs text-slate-400">
                        <span className="font-semibold text-amber-200/80">3–9:</span> {a.ageNotesYounger}
                      </span>
                    )}
                    {a.ageNotesOlder && (
                      <span className="block text-xs text-slate-400">
                        <span className="font-semibold text-amber-200/80">10+:</span> {a.ageNotesOlder}
                      </span>
                    )}
                  </td>
                  <td className="text-slate-300">{a.type === "full" ? "Full" : "Half"}</td>
                  <td className="text-slate-300">{AGE_LABEL[a.ageFit]}</td>
                  <td className="text-slate-300">{AREA_LABEL[a.area]}</td>
                  <td className="text-right tabular-nums text-slate-300">
                    {a.adultPrice ? `${a.estimate ? "~" : ""}$${a.adultPrice}` : "Free"}
                    {a.datePrices && Object.keys(a.datePrices).length > 0 && <span className="text-amber-300" title="Price varies by date">*</span>}
                  </td>
                  <td className="text-right tabular-nums text-slate-300">{a.childPrice ? `${a.estimate ? "~" : ""}$${a.childPrice}` : "Free"}</td>
                  <td className="text-right font-semibold tabular-nums text-amber-200">{ticketCost(a) ? fmt(ticketCost(a)) : "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Total */}
      <section id="your-total" className="mt-8 scroll-mt-40 rounded-3xl border border-amber-300/30 bg-amber-300/5 p-5 backdrop-blur-md">
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
