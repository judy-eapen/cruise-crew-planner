"use client";

import { useEffect, useState } from "react";
import { PARKS, RIDES, type ParkId, type Ride, type RideKind } from "@/data/rides";

const KIND_ICON: Record<RideKind, string> = {
  coaster: "🎢",
  dark: "🛸",
  water: "💦",
  family: "🚂",
  kiddie: "🎠",
};

const THRILL_LABEL = ["", "gentle", "moderate", "intense"] as const;
const THRILL_STYLE = [
  "",
  "bg-emerald-400/15 text-emerald-300",
  "bg-amber-300/15 text-amber-200",
  "bg-pink-400/15 text-pink-300",
] as const;

// The height cutoffs that actually exist across the loaded parks.
const HEIGHT_CHIPS = [32, 34, 36, 38, 40, 42, 44, 48, 51, 54] as const;

function heightBadge(r: Ride): string {
  if (r.minHeight === null) return "any height";
  if (r.maxHeight) return `${r.minHeight}″–${r.maxHeight}″`;
  return `${r.minHeight}″+`;
}

function canRide(r: Ride, h: number): boolean {
  if (r.minHeight !== null && h < r.minHeight) return false;
  if (r.maxHeight && h > r.maxHeight) return false;
  return true;
}

function RideRow({ ride, height }: { ride: Ride; height: number | null }) {
  const short = height !== null && !canRide(ride, height);
  const needs = ride.minHeight !== null && height !== null ? ride.minHeight - height : 0;
  return (
    <div
      className={`flex flex-wrap items-start gap-x-3 gap-y-1 rounded-xl border px-3.5 py-2.5 ${
        short ? "border-white/5 bg-white/[0.02] opacity-55" : "border-white/10 bg-white/5"
      }`}
    >
      <span className="text-lg leading-6" title={ride.kind}>
        {KIND_ICON[ride.kind]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{ride.name}</p>
        <p className="text-xs text-slate-400">{ride.land}</p>
        {ride.note && <p className="mt-0.5 text-xs text-slate-300">{ride.note}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${THRILL_STYLE[ride.thrill]}`}>
          {THRILL_LABEL[ride.thrill]}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            ride.minHeight === null
              ? "bg-emerald-400/15 text-emerald-300"
              : short
                ? "bg-pink-400/15 text-pink-300"
                : "bg-white/10 text-amber-200"
          }`}
        >
          📏 {heightBadge(ride)}
          {short && ride.maxHeight && height! > ride.maxHeight ? " · too tall" : short ? ` · ${needs}″ to go` : ""}
        </span>
      </div>
    </div>
  );
}

export default function RidesGuide({ focusPark }: { focusPark?: ParkId | null }) {
  const [parkId, setParkId] = useState<ParkId>("usf");
  const [height, setHeight] = useState<number | null>(null);

  // "Who can ride?" links in the builder land here with their park pre-selected.
  useEffect(() => {
    if (focusPark && PARKS.find((p) => p.id === focusPark)?.available) setParkId(focusPark);
  }, [focusPark]);

  const park = PARKS.find((p) => p.id === parkId)!;
  const rides = RIDES.filter((r) => r.park === parkId);

  const rideable = height === null ? rides : rides.filter((r) => canRide(r, height));
  const notYet = height === null ? [] : rides.filter((r) => !canRide(r, height));

  // "Show all" view: group by requirement, lowest bar first.
  const thresholds = Array.from(new Set(rides.map((r) => r.minHeight ?? 0))).sort((a, b) => a - b);

  const chip = (selected: boolean, onClick: () => void, label: string, disabled = false, title?: string) => (
    <button
      key={label}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        selected
          ? "bg-amber-300 text-indigo-950"
          : disabled
            ? "cursor-not-allowed bg-white/5 text-slate-500"
            : "bg-white/10 text-slate-200 hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <h2 className="font-display mb-1 text-2xl tracking-wide text-white">Who can ride what?</h2>
      <p className="mb-4 max-w-2xl text-sm text-slate-400">
        Every ride at every park with its height requirement. Tap your kid&apos;s height to see their exact list —
        measure in shoes, parks check with shoes on.
      </p>

      {/* Park picker */}
      <div className="mb-3 flex flex-wrap gap-2">
        {PARKS.map((p) =>
          chip(
            parkId === p.id,
            () => setParkId(p.id),
            `${p.emoji} ${p.short}${p.available ? "" : " · soon"}`,
            !p.available,
            p.available ? p.name : `${p.name} — ride data coming soon`
          )
        )}
      </div>

      {park.note && <p className="mb-3 text-xs font-semibold text-amber-200/90">ℹ️ {park.note}</p>}

      {/* Height picker */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5">
        <span className="pl-1 text-xs font-bold uppercase tracking-wide text-slate-400">Kid&apos;s height:</span>
        {chip(height === null, () => setHeight(null), "show all")}
        {HEIGHT_CHIPS.map((h) => chip(height === h, () => setHeight(h), `${h}″`))}
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
          exact
          <input
            type="number"
            min={30}
            max={80}
            value={height ?? ""}
            placeholder="in"
            onChange={(e) => setHeight(e.target.value === "" ? null : Math.max(30, Math.min(80, Number(e.target.value))))}
            className="w-14 rounded border border-white/20 bg-white/10 px-1.5 py-1 text-center text-white"
          />
        </label>
      </div>

      {height !== null ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold text-emerald-300">
              ✅ Can ride at {height}″ — {rideable.length} of {rides.length} at {park.short}
            </p>
            <div className="space-y-2">
              {[...rideable]
                .sort((a, b) => (b.minHeight ?? 0) - (a.minHeight ?? 0))
                .map((r) => (
                  <RideRow key={r.id} ride={r} height={height} />
                ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-pink-300">🚫 Not yet — {notYet.length} more to grow into</p>
            <div className="space-y-2">
              {[...notYet]
                .sort((a, b) => (a.minHeight ?? 0) - (b.minHeight ?? 0))
                .map((r) => (
                  <RideRow key={r.id} ride={r} height={height} />
                ))}
              {notYet.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-300">
                  Tall enough for everything here. 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {thresholds.map((t) => {
            const group = rides
              .filter((r) => (r.minHeight ?? 0) === t)
              .sort((a, b) => a.name.localeCompare(b.name));
            return (
              <div key={t}>
                <p className="mb-2 text-sm font-bold text-amber-200">
                  {t === 0 ? "🌟 Any height — the whole crew" : `📏 ${t}″ and up`}
                  <span className="ml-2 font-normal text-slate-400">
                    {group.length} ride{group.length === 1 ? "" : "s"}
                  </span>
                </p>
                <div className="grid gap-2 lg:grid-cols-2">
                  {group.map((r) => (
                    <RideRow key={r.id} ride={r} height={null} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Heights verified Aug 2026 from each park&apos;s official site or safety guide (Big Thunder dropped to
        38″ in May 2026) · <span className="text-emerald-300">gentle</span> = fine for the 4–9 crowd ·{" "}
        <span className="text-amber-200">moderate</span> = judgment call for littles who clear the bar ·{" "}
        <span className="text-pink-300">intense</span> = built for the 10+ kids (and brave grown-ups) · closed
        rides (Rip Ride Rockit, Fast &amp; Furious, DINOSAUR) excluded
      </p>
    </div>
  );
}
