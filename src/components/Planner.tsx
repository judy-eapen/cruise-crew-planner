"use client";

import { useEffect, useMemo, useState } from "react";
import { SEED } from "@/data/trip";
import type { Origin, TripData } from "@/lib/types";
import { costsForAllOptions, partyFromFamily, type PartySize } from "@/lib/pricing";
import CompareTab from "./CompareTab";
import ItineraryTab from "./ItineraryTab";
import GroupTab from "./GroupTab";
import VoteTab from "./VoteTab";

const TABS = ["Compare", "Itinerary", "Group", "Vote"] as const;
type Tab = (typeof TABS)[number];

export default function Planner() {
  // Render instantly on bundled seed data; swap in DB data when it arrives.
  const [data, setData] = useState<TripData>(SEED);
  const [tab, setTab] = useState<Tab>("Compare");
  const [origin, setOrigin] = useState<Origin>("BWI");
  const [hotelId, setHotelId] = useState(SEED.hotels[0].id);
  const [familyId, setFamilyId] = useState(SEED.families[0].id);
  const [custom, setCustom] = useState<PartySize>({ adults: 2, kids39: 1, kids10plus: 1, rooms: 1 });

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d: TripData) => {
        if (d?.source === "db") {
          setData(d);
          setHotelId((h) => (d.hotels.some((x) => x.id === h) ? h : d.hotels[0]?.id));
          setFamilyId((f) => (f === "custom" || d.families.some((x) => x.id === f) ? f : d.families[0]?.id));
        }
      })
      .catch(() => {});
  }, []);

  const selectedFamily = data.families.find((f) => f.id === familyId);
  const party: PartySize = familyId === "custom" || !selectedFamily ? custom : partyFromFamily(selectedFamily);

  const costs = useMemo(() => costsForAllOptions(data, origin, hotelId, party), [data, origin, hotelId, party]);
  const familyLabel = familyId === "custom" || !selectedFamily ? "Custom family" : selectedFamily.name;
  const priceChecked = data.flights[0]?.priceChecked ?? "2026-08-14";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[linear-gradient(168deg,#0a0e2a_0%,#171247_35%,#2a1a68_68%,#3d2384_100%)] text-slate-100">
      {/* Pixie-dust glow blobs */}
      <div className="pointer-events-none absolute -top-32 right-[-8%] h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] left-[-8%] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[22%] h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl" />
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(1.5px_1.5px_at_12%_18%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_28%_8%,#fde68a_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_46%_26%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_64%_12%,#fff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_81%_22%,#fde68a_50%,transparent_51%),radial-gradient(1px_1px_at_92%_9%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_73%_38%,#fff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_8%_44%,#fde68a_50%,transparent_51%)]" />

      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0e2a]/75 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4 px-5 py-3 lg:px-12">
          <span className="flex items-center gap-2 text-xl tracking-wide">
            <span className="text-2xl">🏰</span>
            <span className="font-display">
              Cruise<span className="text-amber-300">Crew</span>
            </span>
            <span className="text-sm">✨</span>
          </span>
          <nav className="hidden gap-1 sm:flex">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  tab === t ? "bg-white/15 text-amber-200 shadow-inner" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
          <span className="hidden items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200 md:flex">
            ⚓ Booked · Nov 2 → Nov 6
          </span>
        </div>
        {/* Mobile tabs */}
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                tab === t ? "bg-white/15 text-amber-200" : "text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative w-full overflow-hidden px-5 pt-10 pb-10 lg:px-12 lg:pt-12">
        {/* Castle silhouette + fireworks scene */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] sm:block">
          <div className="absolute right-[30%] top-[8%] text-amber-300 firework" />
          <div className="absolute right-[12%] top-[22%] text-pink-400 firework" style={{ animationDelay: "0.9s" }} />
          <div className="absolute right-[46%] top-[30%] text-cyan-300 firework" style={{ animationDelay: "1.7s" }} />
          <svg
            viewBox="0 0 460 260"
            className="absolute bottom-0 right-0 h-[88%] w-auto opacity-90"
            aria-hidden="true"
          >
            {/* glow behind the castle */}
            <ellipse cx="260" cy="235" rx="200" ry="90" fill="url(#castleGlow)" />
            <defs>
              <radialGradient id="castleGlow">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g fill="#080b24">
              {/* outer walls */}
              <rect x="80" y="190" width="90" height="70" />
              <rect x="290" y="190" width="90" height="70" />
              {/* wall crenellations */}
              <rect x="80" y="182" width="12" height="10" />
              <rect x="104" y="182" width="12" height="10" />
              <rect x="128" y="182" width="12" height="10" />
              <rect x="152" y="182" width="12" height="10" />
              <rect x="290" y="182" width="12" height="10" />
              <rect x="314" y="182" width="12" height="10" />
              <rect x="338" y="182" width="12" height="10" />
              <rect x="362" y="182" width="12" height="10" />
              {/* outer towers */}
              <rect x="62" y="150" width="24" height="110" />
              <polygon points="60,150 88,150 74,112" />
              <rect x="374" y="150" width="24" height="110" />
              <polygon points="372,150 400,150 386,112" />
              {/* mid towers */}
              <rect x="170" y="130" width="26" height="130" />
              <polygon points="167,130 199,130 183,86" />
              <rect x="264" y="130" width="26" height="130" />
              <polygon points="261,130 293,130 277,86" />
              {/* main keep */}
              <rect x="196" y="150" width="68" height="110" />
              <rect x="196" y="142" width="10" height="8" />
              <rect x="214" y="142" width="10" height="8" />
              <rect x="232" y="142" width="10" height="8" />
              <rect x="250" y="142" width="10" height="8" />
              {/* central spire */}
              <rect x="216" y="70" width="28" height="80" />
              <polygon points="212,70 248,70 230,18" />
              {/* flag */}
              <line x1="230" y1="18" x2="230" y2="4" stroke="#080b24" strokeWidth="2.5" />
              <polygon points="230,4 246,9 230,14" fill="#f472b6" />
              {/* windows */}
              <g fill="#fde68a" className="twinkle">
                <rect x="224" y="92" width="5" height="9" rx="2" />
                <rect x="233" y="92" width="5" height="9" rx="2" />
                <rect x="180" y="150" width="6" height="10" rx="2" />
                <rect x="274" y="150" width="6" height="10" rx="2" />
                <rect x="212" y="180" width="6" height="11" rx="2" />
                <rect x="227" y="180" width="6" height="11" rx="2" />
                <rect x="242" y="180" width="6" height="11" rx="2" />
              </g>
              {/* gate */}
              <path d="M218 260 v-28 a12 12 0 0 1 24 0 v28 z" fill="#1e1b4b" />
            </g>
          </svg>
        </div>

        <div className="relative">
          <p className="font-script text-xl text-pink-300 sm:text-2xl">the most magical crew trip ✨</p>
          <h1 className="font-display mt-1 bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-6xl tracking-wide text-transparent sm:text-8xl">
            ORLANDO
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            The cruise is booked — Mon <span className="font-semibold text-white">Nov 2</span> (board PM) to Fri{" "}
            <span className="font-semibold text-white">Nov 6</span> (off 9am). Six ways to wrap the magic
            around it. Pick your family. See <span className="font-semibold text-amber-200">your</span> price.
            Vote.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.35em] text-amber-300/80">
            14 adults · 14 kids · one castle to storm
          </p>
        </div>
      </section>

      {/* Selector bar */}
      <div className="sticky top-[52px] z-20 w-full px-5 sm:top-[56px] lg:px-12">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
          <div className="flex overflow-hidden rounded-full border border-white/15 bg-white/5">
            {(["IAD", "DCA", "BWI"] as Origin[]).map((o) => (
              <button
                key={o}
                onClick={() => setOrigin(o)}
                className={`px-3.5 py-1.5 text-sm font-bold transition ${
                  origin === o ? "bg-amber-300 text-indigo-950" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          <select
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            className="max-w-[44vw] rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-100 [&>option]:text-slate-900"
            aria-label="Hotel"
          >
            {data.hotels.map((h) => (
              <option key={h.id} value={h.id}>
                🏨 {h.name} (~${h.nightlyRate}/nt)
              </option>
            ))}
          </select>
          <select
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
            className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-100 [&>option]:text-slate-900"
            aria-label="Family"
          >
            {data.families.map((f) => (
              <option key={f.id} value={f.id}>
                👨‍👩‍👧‍👦 {f.name} ({f.adults}A + {f.kids39 + f.kids10plus}K)
              </option>
            ))}
            <option value="custom">✏️ Custom…</option>
          </select>
          {familyId === "custom" && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
              {(
                [
                  ["Adults", "adults"],
                  ["Kids 3–9", "kids39"],
                  ["Kids 10+", "kids10plus"],
                  ["Rooms", "rooms"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="flex items-center gap-1 text-xs font-medium text-slate-200">
                  {label}
                  <input
                    type="number"
                    min={0}
                    max={9}
                    value={custom[key]}
                    onChange={(e) => setCustom({ ...custom, [key]: Math.max(0, Number(e.target.value)) })}
                    className="w-12 rounded border border-white/20 bg-white/10 px-1 py-0.5 text-center text-white"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="relative w-full px-5 pt-6 pb-16 lg:px-12">
        {tab === "Compare" && <CompareTab costs={costs} familyLabel={familyLabel} />}
        {tab === "Itinerary" && (
          <ItineraryTab data={data} origin={origin} hotelId={hotelId} party={party} familyLabel={familyLabel} />
        )}
        {tab === "Group" && <GroupTab data={data} origin={origin} hotelId={hotelId} />}
        {tab === "Vote" && <VoteTab data={data} />}
        <p className="mt-12 border-t border-white/10 pt-4 text-xs text-slate-400">
          Prices checked {priceChecked} · ~ marks estimated prices pending confirmation · park child pricing =
          ages 3–9; kids 10+ pay adult prices; all kids pay adult airfare
        </p>
      </main>
    </div>
  );
}
