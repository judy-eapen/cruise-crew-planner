"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { TripData } from "@/lib/types";
import FireworksBackdrop from "@/components/FireworksBackdrop";

interface VoteLink {
  id: string;
  name: string;
  token: string;
  voted: boolean;
}

interface AdminAction {
  action: string;
  payload?: Record<string, unknown>;
}

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData] = useState<TripData | null>(null);
  const [links, setLinks] = useState<VoteLink[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newHotel, setNewHotel] = useState({ name: "", sp2: "", sp1: "", so2: "", so1: "", stars: "3", area: "", type: "hotel", mode: "per_room_night", link: "", shf: "7", hbr: "", hbd: "", hba: "", hsl: "" });
  const [newQuote, setNewQuote] = useState({ optionId: "A", origin: "BWI", airline: "", outDepart: "", outArrive: "", retDepart: "", retArrive: "", duration: "", fare: "", bagFee: "50" });

  const call = useCallback(
    async (body: AdminAction, code?: string) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": code ?? passcode },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      return json;
    },
    [passcode]
  );

  const refresh = useCallback(async () => {
    const d = await fetch("/api/data").then((r) => r.json());
    setData(d);
    setDrafts({});
    try {
      const l = await call({ action: "links" });
      setLinks(l.links ?? []);
    } catch {
      setLinks([]);
    }
  }, [call]);

  useEffect(() => {
    const saved = sessionStorage.getItem("ccp-admin");
    if (saved) {
      setPasscode(saved);
      call({ action: "ping" }, saved)
        .then(() => setUnlocked(true))
        .catch(() => sessionStorage.removeItem("ccp-admin"));
    }
  }, [call]);

  useEffect(() => {
    if (unlocked) refresh();
  }, [unlocked, refresh]);

  const unlock = async () => {
    try {
      await call({ action: "ping" });
      sessionStorage.setItem("ccp-admin", passcode);
      setUnlocked(true);
      setStatus("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    }
  };

  const run = async (body: AdminAction, okMsg: string) => {
    setStatus("Working…");
    try {
      await call(body);
      setStatus(okMsg);
      await refresh();
    } catch (e) {
      setStatus(`⚠ ${e instanceof Error ? e.message : "Failed"}`);
    }
  };

  const draftKey = (...parts: (string | number)[]) => parts.join("|");
  const draft = (key: string, fallback: string | number) => drafts[key] ?? String(fallback);
  const setDraft = (key: string, value: string) => setDrafts((d) => ({ ...d, [key]: value }));

  const numCls = "w-20 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-white text-right";
  const txtCls = "rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-white";
  const selCls = "rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-white [&>option]:text-slate-900";
  const btnCls = "rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-indigo-950 hover:bg-amber-200 transition";
  const delCls = "rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-pink-300 hover:bg-white/20";
  const cardCls = "mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md";

  if (!unlocked) {
    return (
      <div className="relative min-h-screen bg-[linear-gradient(168deg,#0a0e2a_0%,#171247_35%,#2a1a68_68%,#3d2384_100%)] px-5 py-16 text-slate-100">
        <FireworksBackdrop />
        <div className="relative mx-auto max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
          <p className="text-4xl">🔐</p>
          <h1 className="font-display mt-3 text-2xl tracking-wide">Admin</h1>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="Passcode"
            className="mt-4 w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-white"
          />
          <button onClick={unlock} className="mt-3 w-full rounded-full bg-amber-300 px-4 py-2 font-bold text-indigo-950">
            Unlock
          </button>
          {status && <p className="mt-3 text-sm text-pink-300">{status}</p>}
          <Link href="/" className="mt-4 block text-xs text-slate-400 hover:text-white">
            ← back to the app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[linear-gradient(168deg,#0a0e2a_0%,#171247_35%,#2a1a68_68%,#3d2384_100%)] px-5 py-10 text-slate-100 lg:px-12">
      <FireworksBackdrop />
      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl tracking-wide">
            🔧 Trip <span className="text-amber-300">Admin</span>
          </h1>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                data?.source === "db" ? "bg-emerald-400/20 text-emerald-300" : "bg-pink-400/20 text-pink-300"
              }`}
            >
              {data?.source === "db" ? "● database connected" : "● serving seed data — seed the DB below"}
            </span>
            <Link href="/" className="text-xs text-slate-400 hover:text-white">
              ← app
            </Link>
          </div>
        </div>
        {status && <p className="mt-3 text-sm text-amber-200">{status}</p>}

        {/* Seed */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Database</h2>
          <p className="mt-1 text-sm text-slate-400">
            Loads the bundled seed data into Supabase (safe to re-run; keeps family tokens, family edits, votes,
            and any flight quotes you&apos;ve entered).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => run({ action: "seed" }, "Seeded ✨")} className={btnCls}>
              Seed database
            </button>
            <button
              onClick={async () => {
                setStatus("Exporting…");
                try {
                  const dump = await call({ action: "export" });
                  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `cruise-crew-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                  setStatus("Backup downloaded 💾 — do this before any database surgery");
                } catch (e) {
                  setStatus(`⚠ ${e instanceof Error ? e.message : "Export failed"}`);
                }
              }}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-white/20"
            >
              💾 Export backup (JSON)
            </button>
          </div>
        </section>

        {/* Vote links */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Family vote links</h2>
          <p className="mt-1 text-sm text-slate-400">DM each family their own link — the link is their identity.</p>
          <div className="mt-3 space-y-2">
            {links.length === 0 && <p className="text-sm text-slate-500">No families in the database yet.</p>}
            {links.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="w-32 font-semibold text-white">{l.name}</span>
                <code className="rounded bg-white/10 px-2 py-0.5 text-xs text-amber-100">/vote/{l.token}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/vote/${l.token}`);
                    setStatus(`Copied ${l.name}'s link 📋`);
                  }}
                  className={btnCls}
                >
                  Copy link
                </button>
                <span className={`text-xs ${l.voted ? "text-emerald-300" : "text-slate-500"}`}>
                  {l.voted ? "✓ voted" : "hasn't voted"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Flight quotes */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Flight quotes</h2>
          <p className="mt-1 text-sm text-slate-400">
            ~3 real quotes per option, NONSTOP flights only (the app surfaces them cheapest-first). Fare = round trip per person; bag
            fee = round trip per checked bag ($0 if bags fly free, e.g. Southwest). Saving stamps today&apos;s
            date and clears the ~ estimate flag. Delete the TBD placeholders as real quotes land.
          </p>
          {data?.dateOptions.map((o) => (
            <div key={o.id} className="mt-4 border-t border-white/10 pt-3">
              <p className="text-sm font-bold text-amber-200">
                Option {o.id} · {o.departDate.slice(5)} → {o.returnDate.slice(5)}
              </p>
              <div className="mt-2 space-y-2">
                {data.flights
                  .filter((f) => f.optionId === o.id)
                  .sort((a, b) => a.farePerPerson - b.farePerPerson)
                  .map((f) => {
                    const k = (field: string) => draftKey("q", f.id, field);
                    return (
                      <div key={f.id} className="flex flex-wrap items-center gap-2 text-sm">
                        <select className={selCls} value={draft(k("or"), f.origin)} onChange={(e) => setDraft(k("or"), e.target.value)}>
                          {["IAD", "DCA", "BWI"].map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                        <input
                          className={`${txtCls} w-28`}
                          placeholder="Airline"
                          value={draft(k("al"), f.airline)}
                          onChange={(e) => setDraft(k("al"), e.target.value)}
                        />
                        {f.estimate && <span className="text-xs text-slate-500">~</span>}
                        <span className="text-xs text-slate-500">out</span>
                        <input className={`${txtCls} w-24`} placeholder="7:05 AM" value={draft(k("od"), f.outDepart)} onChange={(e) => setDraft(k("od"), e.target.value)} />
                        <span className="text-xs text-slate-500">→</span>
                        <input className={`${txtCls} w-24`} placeholder="9:45 AM" value={draft(k("oa"), f.outArrive)} onChange={(e) => setDraft(k("oa"), e.target.value)} />
                        <span className="text-xs text-slate-500">back</span>
                        <input className={`${txtCls} w-24`} placeholder="6:10 PM" value={draft(k("rd"), f.retDepart)} onChange={(e) => setDraft(k("rd"), e.target.value)} />
                        <span className="text-xs text-slate-500">→</span>
                        <input className={`${txtCls} w-24`} placeholder="8:40 PM" value={draft(k("ra"), f.retArrive)} onChange={(e) => setDraft(k("ra"), e.target.value)} />
                        <input className={`${txtCls} w-20`} placeholder="~2h 15m" value={draft(k("du"), f.duration)} onChange={(e) => setDraft(k("du"), e.target.value)} />
                        <span className="text-xs text-slate-500">fare $</span>
                        <input className={numCls} value={draft(k("fare"), f.farePerPerson)} onChange={(e) => setDraft(k("fare"), e.target.value)} />
                        <span className="text-xs text-slate-500">bag $</span>
                        <input className={numCls} value={draft(k("bag"), f.bagFee)} onChange={(e) => setDraft(k("bag"), e.target.value)} />
                        <button
                          onClick={() =>
                            run(
                              {
                                action: "update-quote",
                                payload: {
                                  id: f.id,
                                  airline: draft(k("al"), f.airline),
                                  origin: draft(k("or"), f.origin),
                                  farePerPerson: Number(draft(k("fare"), f.farePerPerson)),
                                  bagFee: Number(draft(k("bag"), f.bagFee)),
                                  outDepart: draft(k("od"), f.outDepart),
                                  outArrive: draft(k("oa"), f.outArrive),
                                  retDepart: draft(k("rd"), f.retDepart),
                                  retArrive: draft(k("ra"), f.retArrive),
                                  duration: draft(k("du"), f.duration),
                                },
                              },
                              `Saved ${f.airline} quote ✓`
                            )
                          }
                          className={btnCls}
                        >
                          Save
                        </button>
                        <button onClick={() => run({ action: "delete-quote", payload: { id: f.id } }, "Quote removed")} className={delCls}>
                          ✕
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
          {/* Add quote */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-sm">
            <select value={newQuote.optionId} onChange={(e) => setNewQuote({ ...newQuote, optionId: e.target.value })} className={selCls}>
              {data?.dateOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} · {o.departDate.slice(5)}→{o.returnDate.slice(5)}
                </option>
              ))}
            </select>
            <select value={newQuote.origin} onChange={(e) => setNewQuote({ ...newQuote, origin: e.target.value })} className={selCls}>
              {["IAD", "DCA", "BWI"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input placeholder="Airline" className={`${txtCls} w-28`} value={newQuote.airline} onChange={(e) => setNewQuote({ ...newQuote, airline: e.target.value })} />
            <input placeholder="out dep 7:05 AM" className={`${txtCls} w-28`} value={newQuote.outDepart} onChange={(e) => setNewQuote({ ...newQuote, outDepart: e.target.value })} />
            <input placeholder="out arr 9:45 AM" className={`${txtCls} w-28`} value={newQuote.outArrive} onChange={(e) => setNewQuote({ ...newQuote, outArrive: e.target.value })} />
            <input placeholder="back dep 6:10 PM" className={`${txtCls} w-28`} value={newQuote.retDepart} onChange={(e) => setNewQuote({ ...newQuote, retDepart: e.target.value })} />
            <input placeholder="back arr 8:40 PM" className={`${txtCls} w-28`} value={newQuote.retArrive} onChange={(e) => setNewQuote({ ...newQuote, retArrive: e.target.value })} />
            <input placeholder="dur ~2h 15m" className={`${txtCls} w-24`} value={newQuote.duration} onChange={(e) => setNewQuote({ ...newQuote, duration: e.target.value })} />
            <span className="text-xs text-slate-500">fare $</span>
            <input className={numCls} value={newQuote.fare} onChange={(e) => setNewQuote({ ...newQuote, fare: e.target.value })} />
            <span className="text-xs text-slate-500">bag $</span>
            <input className={numCls} value={newQuote.bagFee} onChange={(e) => setNewQuote({ ...newQuote, bagFee: e.target.value })} />
            <button
              onClick={() => {
                if (!newQuote.airline.trim()) { setStatus("⚠ Enter an airline first"); return; }
                if (!newQuote.fare) { setStatus("⚠ Enter the fare per person"); return; }
                run(
                  {
                    action: "add-quote",
                    payload: {
                      optionId: newQuote.optionId,
                      origin: newQuote.origin,
                      airline: newQuote.airline.trim(),
                      outDepart: newQuote.outDepart,
                      outArrive: newQuote.outArrive,
                      retDepart: newQuote.retDepart,
                      retArrive: newQuote.retArrive,
                      duration: newQuote.duration,
                      farePerPerson: Number(newQuote.fare),
                      bagFee: Number(newQuote.bagFee || 0),
                    },
                  },
                  `Added ${newQuote.airline} quote ✓`
                );
                setNewQuote({ ...newQuote, airline: "", outDepart: "", outArrive: "", retDepart: "", retArrive: "", duration: "", fare: "", bagFee: "50" });
              }}
              className={btnCls}
            >
              + Add quote
            </button>
          </div>
        </section>

        {/* Hotels */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Hotels & Airbnbs</h2>
          <p className="mt-1 text-sm text-slate-400">
            Four STAY TOTALS per property — enter exactly what the booking site quotes for 10/31→11/2, 11/1→11/2, 11/6→11/8, and 11/6→11/7 (the only stays any option uses). Leave a window's totals at 0 and the property only appears in the picker for the window it serves — so a before-cruise Airbnb and a separate after-cruise Airbnb are just two rows, each with its own split count. Each total is per room (hotels) or for the whole property split across its 'split N ways' count of{" "}
            {data?.families.length ?? 7} families (Airbnb mode).
          </p>
          <div className="mt-3 space-y-2">
            {data?.hotels.map((h) => {
              const k = (field: string) => draftKey("h", h.id, field);
              return (
                <div key={h.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <input className={`${txtCls} min-w-56 flex-1`} value={draft(k("name"), h.name)} onChange={(e) => setDraft(k("name"), e.target.value)} />
                  {(
                    [
                      ["10/31→11/2", "sp2", h.stayPre2],
                      ["11/1→11/2", "sp1", h.stayPre1],
                      ["11/6→11/8", "so2", h.stayPost2],
                      ["11/6→11/7", "so1", h.stayPost1],
                    ] as const
                  ).map(([label, key, val]) => (
                    <label key={key} className="flex items-center gap-1 text-xs text-slate-500">
                      {label} $
                      <input className={numCls} value={draft(k(key), val)} onChange={(e) => setDraft(k(key), e.target.value)} />
                    </label>
                  ))}
                  <select className={selCls} value={draft(k("mode"), h.priceMode)} onChange={(e) => setDraft(k("mode"), e.target.value)}>
                    <option value="per_room_night">stay total · per room</option>
                    <option value="per_property_night_split">stay total · whole place, split</option>
                  </select>
                  {draft(k("mode"), h.priceMode) === "per_property_night_split" && (
                    <label className="flex items-center gap-1 text-xs text-slate-400">
                      split
                      <input className="w-10 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-center text-white" value={draft(k("shf"), h.sharedFamilies)} onChange={(e) => setDraft(k("shf"), e.target.value)} />
                      ways
                    </label>
                  )}
                  <select className={selCls} value={draft(k("stars"), h.stars)} onChange={(e) => setDraft(k("stars"), e.target.value)}>
                    {[2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s}⭐
                      </option>
                    ))}
                  </select>
                  <input className={`${txtCls} w-40`} placeholder="area" value={draft(k("area"), h.area)} onChange={(e) => setDraft(k("area"), e.target.value)} />
                  <select
                    className={selCls}
                    value={draft(k("type"), h.type)}
                    onChange={(e) => {
                      setDraft(k("type"), e.target.value);
                      setDraft(k("mode"), e.target.value === "airbnb" ? "per_property_night_split" : "per_room_night");
                    }}
                  >
                    <option value="hotel">🏨 hotel</option>
                    <option value="airbnb">🏡 airbnb</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-slate-400">
                    🏊
                    <input type="checkbox" checked={draft(k("pool"), h.pool ? "1" : "") === "1" || (drafts[k("pool")] === undefined && h.pool)} onChange={(e) => setDraft(k("pool"), e.target.checked ? "1" : "")} />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-400">
                    🍳
                    <input type="checkbox" checked={draft(k("bkf"), h.breakfastIncluded ? "1" : "") === "1" || (drafts[k("bkf")] === undefined && h.breakfastIncluded)} onChange={(e) => setDraft(k("bkf"), e.target.checked ? "1" : "")} />
                  </label>
                  <input className={`${txtCls} w-44`} placeholder="🔗 booking link (https://…)" value={draft(k("link"), h.link)} onChange={(e) => setDraft(k("link"), e.target.value)} />
                  <input className={`${txtCls} w-44`} placeholder="↩ cancellation (e.g. free before Oct 26)" value={draft(k("cxl"), h.cancellation)} onChange={(e) => setDraft(k("cxl"), e.target.value)} />
                  {draft(k("type"), h.type) === "airbnb" &&
                    (
                      [
                        ["BR", "hbr", h.bedrooms],
                        ["beds", "hbd", h.beds],
                        ["baths", "hba", h.baths],
                        ["sleeps", "hsl", h.sleeps],
                      ] as const
                    ).map(([label, key, val]) => (
                      <label key={key} className="flex items-center gap-1 text-xs text-slate-400">
                        {label}
                        <input className="w-10 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-center text-white" value={draft(k(key), val)} onChange={(e) => setDraft(k(key), e.target.value)} />
                      </label>
                    ))}
                  <button
                    onClick={() =>
                      run(
                        {
                          action: "upsert-hotel",
                          payload: {
                            id: h.id,
                            name: draft(k("name"), h.name),
                            stayPre2: Number(draft(k("sp2"), h.stayPre2)),
                            stayPre1: Number(draft(k("sp1"), h.stayPre1)),
                            stayPost2: Number(draft(k("so2"), h.stayPost2)),
                            stayPost1: Number(draft(k("so1"), h.stayPost1)),
                            priceMode: draft(k("mode"), h.priceMode),
                            stars: Number(draft(k("stars"), h.stars)),
                            area: draft(k("area"), h.area),
                            type: draft(k("type"), h.type),
                            pool: draft(k("pool"), h.pool ? "1" : "") === "1",
                            breakfastIncluded: draft(k("bkf"), h.breakfastIncluded ? "1" : "") === "1",
                            amenities: h.amenities,
                            link: draft(k("link"), h.link),
                            sharedFamilies: Number(draft(k("shf"), h.sharedFamilies)),
                            cancellation: draft(k("cxl"), h.cancellation),
                            bedrooms: Number(draft(k("hbr"), h.bedrooms)),
                            beds: Number(draft(k("hbd"), h.beds)),
                            baths: Number(draft(k("hba"), h.baths)),
                            sleeps: Number(draft(k("hsl"), h.sleeps)),
                          },
                        },
                        `Saved ${h.id} ✓`
                      )
                    }
                    className={btnCls}
                  >
                    Save
                  </button>
                  <button onClick={() => run({ action: "delete-hotel", payload: { id: h.id } }, "Removed")} className={delCls}>
                    ✕
                  </button>
                </div>
              );
            })}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-sm">
              <input placeholder="New hotel / Airbnb name" className={`${txtCls} min-w-56 flex-1`} value={newHotel.name} onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })} />
              {(
                [
                  ["10/31→11/2", "sp2"],
                  ["11/1→11/2", "sp1"],
                  ["11/6→11/8", "so2"],
                  ["11/6→11/7", "so1"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="flex items-center gap-1 text-xs text-slate-500">
                  {label} $
                  <input placeholder="rate" className={numCls} value={newHotel[key]} onChange={(e) => setNewHotel({ ...newHotel, [key]: e.target.value })} />
                </label>
              ))}
              <select className={selCls} value={newHotel.mode} onChange={(e) => setNewHotel({ ...newHotel, mode: e.target.value })}>
                <option value="per_room_night">stay total · per room</option>
                <option value="per_property_night_split">stay total · whole place, split</option>
              </select>
              {newHotel.type === "airbnb" && (
                <>
                  <label className="flex items-center gap-1 text-xs text-slate-400">
                    split
                    <input className="w-10 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-center text-white" value={newHotel.shf} onChange={(e) => setNewHotel({ ...newHotel, shf: e.target.value })} />
                    ways
                  </label>
                  {(
                    [
                      ["BR", "hbr"],
                      ["beds", "hbd"],
                      ["baths", "hba"],
                      ["sleeps", "hsl"],
                    ] as const
                  ).map(([label, key]) => (
                    <label key={key} className="flex items-center gap-1 text-xs text-slate-400">
                      {label}
                      <input className="w-10 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-center text-white" value={newHotel[key]} onChange={(e) => setNewHotel({ ...newHotel, [key]: e.target.value })} />
                    </label>
                  ))}
                </>
              )}
              <select
                className={selCls}
                value={newHotel.type}
                onChange={(e) =>
                  setNewHotel({
                    ...newHotel,
                    type: e.target.value,
                    mode: e.target.value === "airbnb" ? "per_property_night_split" : "per_room_night",
                  })
                }
              >
                <option value="hotel">🏨 hotel</option>
                <option value="airbnb">🏡 airbnb</option>
              </select>
              <input placeholder="area" className={`${txtCls} w-40`} value={newHotel.area} onChange={(e) => setNewHotel({ ...newHotel, area: e.target.value })} />
              <input placeholder="🔗 booking link" className={`${txtCls} w-44`} value={newHotel.link} onChange={(e) => setNewHotel({ ...newHotel, link: e.target.value })} />
              <button
                onClick={() => {
                  if (!newHotel.name) { setStatus("⚠ Enter a hotel name first"); return; }
                  if (!newHotel.sp2) { setStatus("⚠ Enter at least the 10/31→11/2 stay total"); return; }
                  run(
                    {
                      action: "upsert-hotel",
                      payload: {
                        name: newHotel.name,
                        stayPre2: Number(newHotel.sp2),
                        stayPre1: Number(newHotel.sp1 || 0),
                        stayPost2: Number(newHotel.so2 || 0),
                        stayPost1: Number(newHotel.so1 || 0),
                        priceMode: newHotel.mode,
                        stars: Number(newHotel.stars),
                        area: newHotel.area,
                        type: newHotel.type,
                        pool: false,
                        breakfastIncluded: false,
                        amenities: "",
                        link: newHotel.link,
                        sharedFamilies: Number(newHotel.shf || 7),
                        bedrooms: Number(newHotel.hbr || 0),
                        beds: Number(newHotel.hbd || 0),
                        baths: Number(newHotel.hba || 0),
                        sleeps: Number(newHotel.hsl || 0),
                      },
                    },
                    "Added ✓"
                  );
                  setNewHotel({ name: "", sp2: "", sp1: "", so2: "", so1: "", stars: "3", area: "", type: "hotel", mode: "per_room_night", link: "", shf: "7", hbr: "", hbd: "", hba: "", hsl: "" });
                }}
                className={btnCls}
              >
                + Add
              </button>
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Activities</h2>
          <p className="mt-1 text-sm text-slate-400">Adult price also applies to kids 10+; kid price = ages 3–9.</p>
          <div className="mt-3 space-y-1.5">
            {data?.activities.map((a) => {
              const k = (field: string) => draftKey("a", a.id, field);
              const ACT_DATES = ["2026-10-31", "2026-11-01", "2026-11-06", "2026-11-07", "2026-11-08"] as const;
              const dp = (d: string, kind: "ad" | "ch") => draft(k(`dp|${d}|${kind}`), a.datePrices?.[d]?.[kind === "ad" ? "adult" : "child"] ?? "");
              const datePricesPayload = () => {
                const out: Record<string, { adult: number; child: number }> = {};
                for (const d of ACT_DATES) {
                  const ad = Number(dp(d, "ad"));
                  const ch = Number(dp(d, "ch"));
                  if (ad > 0) out[d] = { adult: ad, child: ch > 0 ? ch : ad };
                }
                return out;
              };
              return (
                <div key={a.id}>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="min-w-52 flex-1 text-slate-200">
                    {a.star ? "⭐ " : ""}
                    {a.name}
                    {a.estimate && <span className="ml-1 text-xs text-slate-500">(~est.)</span>}
                  </span>
                  <span className="text-xs text-slate-500">adult $</span>
                  <input className={numCls} value={draft(k("ap"), a.adultPrice)} onChange={(e) => setDraft(k("ap"), e.target.value)} />
                  <span className="text-xs text-slate-500">kid $</span>
                  <input className={numCls} value={draft(k("cp"), a.childPrice)} onChange={(e) => setDraft(k("cp"), e.target.value)} />
                  <select className={selCls} value={draft(k("age"), a.ageFit)} onChange={(e) => setDraft(k("age"), e.target.value)}>
                    <option value="all">All ages</option>
                    <option value="younger">Best 3–9</option>
                    <option value="older">Best 10+</option>
                    <option value="check">Check restrictions</option>
                  </select>
                  <select className={selCls} value={draft(k("area"), a.area)} onChange={(e) => setDraft(k("area"), e.target.value)}>
                    <option value="orlando">Orlando</option>
                    <option value="port">Near port</option>
                    <option value="daytrip">Day trip</option>
                  </select>
                  <input className={`${txtCls} w-44`} placeholder="🎟 ticket link (https://…)" value={draft(k("link"), a.ticketLink)} onChange={(e) => setDraft(k("link"), e.target.value)} />
                  <button
                    onClick={() =>
                      run(
                        {
                          action: "update-activity",
                          payload: {
                            id: a.id,
                            adultPrice: Number(draft(k("ap"), a.adultPrice)),
                            childPrice: Number(draft(k("cp"), a.childPrice)),
                            ageFit: draft(k("age"), a.ageFit),
                            area: draft(k("area"), a.area),
                            ticketLink: draft(k("link"), a.ticketLink),
                            datePrices: datePricesPayload(),
                          },
                        },
                        `Saved ${a.name} ✓`
                      )
                    }
                    className={btnCls}
                  >
                    Save
                  </button>
                </div>
                {a.adultPrice + a.childPrice > 0 && (
                  <details className="ml-4 mt-1">
                    <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300">
                      📅 per-date prices{a.datePrices && Object.keys(a.datePrices).length > 0 ? ` (${Object.keys(a.datePrices).length} set)` : " (optional — for Disney-style calendar pricing)"}
                    </summary>
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      {ACT_DATES.map((d) => (
                        <div key={d} className="flex items-center gap-1 text-xs text-slate-400">
                          <span className="w-9">{d.slice(5).replace("-", "/")}</span>
                          <span>A$</span>
                          <input className="w-14 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-right text-white" value={dp(d, "ad")} onChange={(e) => setDraft(k(`dp|${d}|ad`), e.target.value)} />
                          <span>K$</span>
                          <input className="w-14 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-right text-white" value={dp(d, "ch")} onChange={(e) => setDraft(k(`dp|${d}|ch`), e.target.value)} />
                        </div>
                      ))}
                      <span className="text-xs text-slate-600">blank = use base price · Save on the row above applies these</span>
                    </div>
                  </details>
                )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Families */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Families</h2>
          <p className="mt-1 text-sm text-slate-400">
            Kids 3–9 get child ticket pricing; kids 10+ pay adult ticket prices. Bags = checked bags for flights.
          </p>
          <div className="mt-3 space-y-2">
            {data?.families.map((f) => {
              const k = (field: string) => draftKey("f", f.id, field);
              return (
                <div key={f.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <input className={`${txtCls} w-40`} value={draft(k("name"), f.name)} onChange={(e) => setDraft(k("name"), e.target.value)} />
                  {(
                    [
                      ["adults", "ad", f.adults],
                      ["kids 3–9", "k9", f.kids39],
                      ["kids 10+", "k10", f.kids10plus],
                      ["rooms", "rm", f.rooms],
                      ["bags", "bg", f.bags],
                    ] as const
                  ).map(([label, key, val]) => (
                    <label key={key} className="flex items-center gap-1 text-xs text-slate-400">
                      {label}
                      <input className="w-12 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-center text-white" value={draft(k(key), val)} onChange={(e) => setDraft(k(key), e.target.value)} />
                    </label>
                  ))}
                  <button
                    onClick={() =>
                      run(
                        {
                          action: "update-family",
                          payload: {
                            id: f.id,
                            name: draft(k("name"), f.name),
                            adults: Number(draft(k("ad"), f.adults)),
                            kids39: Number(draft(k("k9"), f.kids39)),
                            kids10plus: Number(draft(k("k10"), f.kids10plus)),
                            rooms: Number(draft(k("rm"), f.rooms)),
                            bags: Number(draft(k("bg"), f.bags)),
                          },
                        },
                        `Saved ${f.id} ✓`
                      )
                    }
                    className={btnCls}
                  >
                    Save
                  </button>
                  {f.placeholder && <span className="text-xs text-pink-300">placeholder</span>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
