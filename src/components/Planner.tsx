"use client";

import { useEffect, useMemo, useState } from "react";
import { SEED } from "@/data/trip";
import type { Build, OptionId, TripData } from "@/lib/types";
import { costForBuild, defaultBuild, partyFromFamily, type PartySize } from "@/lib/pricing";
import FlightsGlance from "./FlightsGlance";
import FireworksBackdrop from "./FireworksBackdrop";
import BuilderSection from "./BuilderSection";
import GroupTab from "./GroupTab";
import VoteTab from "./VoteTab";

const SECTIONS = [
  { id: "flights", label: "Flights" },
  { id: "build", label: "Build" },
  { id: "group", label: "Group" },
  { id: "vote", label: "Vote" },
] as const;

const BUILDS_KEY = "ccp-builds-v2";

export default function Planner() {
  // Render instantly on bundled seed data; swap in DB data when it arrives.
  const [data, setData] = useState<TripData>(SEED);
  const [active, setActive] = useState<string>("flights");
  const [familyId, setFamilyId] = useState(SEED.families[0].id);
  const [custom, setCustom] = useState<PartySize>({ adults: 2, kids39: 1, kids10plus: 1, rooms: 1, bags: 2 });
  const [showGuide, setShowGuide] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionId>("A");
  // Personal builds live in this browser only; the group table uses the suggested plan.
  const [builds, setBuilds] = useState<Partial<Record<OptionId, Build>>>({});

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d: TripData) => {
        if (d?.source === "db") {
          setData(d);
          setFamilyId((f) => (f === "custom" || d.families.some((x) => x.id === f) ? f : d.families[0]?.id));
        }
      })
      .catch(() => {});
    setShowGuide(!window.localStorage.getItem("ccp-guide-dismissed"));
    try {
      const saved = window.localStorage.getItem(BUILDS_KEY);
      if (saved) setBuilds(JSON.parse(saved));
    } catch {}
  }, []);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const dismissGuide = () => {
    window.localStorage.setItem("ccp-guide-dismissed", "1");
    setShowGuide(false);
  };

  const persistBuilds = (next: Partial<Record<OptionId, Build>>) => {
    setBuilds(next);
    try {
      window.localStorage.setItem(BUILDS_KEY, JSON.stringify(next));
    } catch {}
  };

  const effectiveBuild = (id: OptionId): Build => builds[id] ?? defaultBuild(data, id);
  const updateBuild = (id: OptionId, b: Build) => persistBuilds({ ...builds, [id]: b });
  const resetBuild = (id: OptionId) => {
    const next = { ...builds };
    delete next[id];
    persistBuilds(next);
  };

  const selectedFamily = data.families.find((f) => f.id === familyId);
  const party: PartySize = familyId === "custom" || !selectedFamily ? custom : partyFromFamily(selectedFamily);

  const familyLabel = familyId === "custom" || !selectedFamily ? "Custom family" : selectedFamily.name;
  const priceChecked = data.flights[0]?.priceChecked ?? "2026-08-14";
  const hasEstimates =
    data.flights.some((f) => f.estimate) ||
    data.hotels.some((h) => h.estimate) ||
    data.activities.some((a) => a.estimate && a.adultPrice + a.childPrice > 0);

  const navLink = (id: string, label: string, mobile = false) => (
    <a
      key={id}
      href={`#${id}`}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active === id
          ? "bg-white/15 text-amber-200" + (mobile ? "" : " shadow-inner")
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      } ${mobile ? "whitespace-nowrap" : ""}`}
    >
      {label}
    </a>
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[linear-gradient(168deg,#0a0e2a_0%,#171247_35%,#2a1a68_68%,#3d2384_100%)] text-slate-100">
      <FireworksBackdrop />
      {/* Pixie-dust glow blobs */}
      <div className="pointer-events-none absolute -top-32 right-[-8%] h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] left-[-8%] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[22%] h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl" />
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 h-[900px] opacity-40 [background-image:radial-gradient(1.5px_1.5px_at_12%_18%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_28%_8%,#fde68a_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_46%_26%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_64%_12%,#fff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_81%_22%,#fde68a_50%,transparent_51%),radial-gradient(1px_1px_at_92%_9%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_73%_38%,#fff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_8%_44%,#fde68a_50%,transparent_51%)]" />

      {/* Top nav — table of contents */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0e2a]/75 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4 px-5 py-3 lg:px-12">
          <a href="#top" className="flex items-center gap-2 text-xl tracking-wide">
            <span className="text-2xl">🏰</span>
            <span className="font-display">
              Cruise<span className="text-amber-300">Crew</span>
            </span>
            <span className="text-sm">✨</span>
          </a>
          <nav className="hidden gap-1 sm:flex">{SECTIONS.map((s) => navLink(s.id, s.label))}</nav>
          <span className="hidden items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200 md:flex">
            ⚓ Booked · Nov 2 → Nov 6
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {SECTIONS.map((s) => navLink(s.id, s.label, true))}
        </nav>
      </header>

      {/* Hero */}
      <section id="top" className="relative w-full overflow-hidden px-5 pt-10 pb-8 lg:px-12 lg:pt-12">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] sm:block">
          <div className="absolute right-[30%] top-[8%] text-amber-300 firework" />
          <div className="absolute right-[12%] top-[22%] text-pink-400 firework" style={{ animationDelay: "0.9s" }} />
          <div className="absolute right-[46%] top-[30%] text-cyan-300 firework" style={{ animationDelay: "1.7s" }} />
          <svg viewBox="0 0 460 260" className="absolute bottom-0 right-0 h-[88%] w-auto opacity-90" aria-hidden="true">
            <ellipse cx="260" cy="235" rx="200" ry="90" fill="url(#castleGlow)" />
            <defs>
              <radialGradient id="castleGlow">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g fill="#080b24">
              <rect x="80" y="190" width="90" height="70" />
              <rect x="290" y="190" width="90" height="70" />
              <rect x="80" y="182" width="12" height="10" />
              <rect x="104" y="182" width="12" height="10" />
              <rect x="128" y="182" width="12" height="10" />
              <rect x="152" y="182" width="12" height="10" />
              <rect x="290" y="182" width="12" height="10" />
              <rect x="314" y="182" width="12" height="10" />
              <rect x="338" y="182" width="12" height="10" />
              <rect x="362" y="182" width="12" height="10" />
              <rect x="62" y="150" width="24" height="110" />
              <polygon points="60,150 88,150 74,112" />
              <rect x="374" y="150" width="24" height="110" />
              <polygon points="372,150 400,150 386,112" />
              <rect x="170" y="130" width="26" height="130" />
              <polygon points="167,130 199,130 183,86" />
              <rect x="264" y="130" width="26" height="130" />
              <polygon points="261,130 293,130 277,86" />
              <rect x="196" y="150" width="68" height="110" />
              <rect x="196" y="142" width="10" height="8" />
              <rect x="214" y="142" width="10" height="8" />
              <rect x="232" y="142" width="10" height="8" />
              <rect x="250" y="142" width="10" height="8" />
              <rect x="216" y="70" width="28" height="80" />
              <polygon points="212,70 248,70 230,18" />
              <line x1="230" y1="18" x2="230" y2="4" stroke="#080b24" strokeWidth="2.5" />
              <polygon points="230,4 246,9 230,14" fill="#f472b6" />
              <g fill="#fde68a" className="twinkle">
                <rect x="224" y="92" width="5" height="9" rx="2" />
                <rect x="233" y="92" width="5" height="9" rx="2" />
                <rect x="180" y="150" width="6" height="10" rx="2" />
                <rect x="274" y="150" width="6" height="10" rx="2" />
                <rect x="212" y="180" width="6" height="11" rx="2" />
                <rect x="227" y="180" width="6" height="11" rx="2" />
                <rect x="242" y="180" width="6" height="11" rx="2" />
              </g>
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
            <span className="font-semibold text-white">Nov 6</span> (off 9am). Six ways to wrap the magic around
            it. Pick your flight, build your plan, see your total — then vote.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.35em] text-amber-300/80">
            14 adults · 14 kids · one castle to storm
          </p>
        </div>
      </section>

      {/* First-visit guide */}
      {showGuide && (
        <div className="relative w-full px-5 pb-4 lg:px-12">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            <span className="font-bold">How this works:</span>
            <span>
              <span className="font-bold text-amber-300">①</span> Pick <em>your</em> family below
            </span>
            <span>
              <span className="font-bold text-amber-300">②</span> Pick your dates & flight, then hotels and activities
            </span>
            <span>
              <span className="font-bold text-amber-300">③</span> Vote using your family&apos;s private link
            </span>
            <button
              onClick={dismissGuide}
              className="ml-auto rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-indigo-950 hover:bg-amber-200"
            >
              Got it ✓
            </button>
          </div>
        </div>
      )}

      {/* Selector bar — who are you? */}
      <div className="sticky top-[52px] z-20 w-full px-5 sm:top-[56px] lg:px-12">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#171247]/80 p-2.5 backdrop-blur-md">
          <span className="pl-1 text-xs font-bold uppercase tracking-wide text-slate-400">You are:</span>
          <select
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
            className="rounded-full border border-amber-300/50 bg-white/5 px-3.5 py-1.5 text-sm font-bold text-amber-100 [&>option]:text-slate-900"
            aria-label="Family"
          >
            {data.families.map((f) => (
              <option key={f.id} value={f.id}>
                👨‍👩‍👧‍👦 {f.name} ({f.adults}A + {f.kids39 + f.kids10plus}K · {f.bags} bags)
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
                  ["Bags", "bags"],
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
          {hasEstimates && (
            <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 md:inline-flex">
              <span className="font-bold text-amber-300">~</span> Prices are estimates · checked {priceChecked}
            </span>
          )}
        </div>
        {hasEstimates && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 md:hidden">
            <span className="font-bold text-amber-300">~</span> Prices are estimates · checked {priceChecked}
          </p>
        )}
      </div>

      {/* One long page — sections in narrative order */}
      <main className="relative w-full space-y-16 px-5 pt-10 pb-16 lg:px-12">
        <section id="flights" className="scroll-mt-40">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300/80">01 · Dates & flights</p>
          <FlightsGlance
            data={data}
            party={party}
            familyLabel={familyLabel}
            selectedOption={selectedOption}
            buildFor={effectiveBuild}
            onPickQuote={(id, quoteId) => {
              setSelectedOption(id);
              updateBuild(id, { ...effectiveBuild(id), flightId: quoteId });
            }}
            onSelectOption={setSelectedOption}
          />
        </section>

        <section id="build" className="scroll-mt-40">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300/80">02 · Hotels, activities & your total</p>
          <h2 className="font-display mb-1 text-2xl tracking-wide text-white">
            Make Option {selectedOption} yours
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            Pick the flight, the hotels, and what to do each free day — your total updates live. Your build is
            saved on this device; the suggested plan is always one tap away.
          </p>
          <BuilderSection
            data={data}
            party={party}
            familyLabel={familyLabel}
            optionId={selectedOption}
            onSelectOption={setSelectedOption}
            build={effectiveBuild(selectedOption)}
            onUpdateBuild={(b) => updateBuild(selectedOption, b)}
            onReset={() => resetBuild(selectedOption)}
            isCustomized={Boolean(builds[selectedOption])}
          />
        </section>

        <section id="group" className="scroll-mt-40">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300/80">03 · The whole crew</p>
          <GroupTab data={data} />
        </section>

        <section id="vote" className="scroll-mt-40">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300/80">04 · Decide</p>
          <VoteTab data={data} />
        </section>

        <p className="border-t border-white/10 pt-4 text-xs text-slate-400">
          Prices checked {priceChecked} · ~ marks estimated prices pending confirmation · park child pricing =
          ages 3–9; kids 10+ pay adult prices; all kids pay adult airfare · checked bags assumed $50 each
          (round trip) unless a flight quote says otherwise · only nonstop flights were searched · group table shows the suggested plan for
          consistency
        </p>
      </main>
    </div>
  );
}
