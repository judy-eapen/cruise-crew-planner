"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { TripData } from "@/lib/types";

interface VoteLink {
  id: string;
  name: string;
  token: string;
  voted: boolean;
}

type AdminAction =
  | { action: "ping" | "seed" | "links" }
  | { action: "update-flight" | "upsert-hotel" | "delete-hotel" | "update-activity" | "update-family"; payload: Record<string, unknown> };

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData] = useState<TripData | null>(null);
  const [links, setLinks] = useState<VoteLink[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newHotel, setNewHotel] = useState({ name: "", nightlyRate: "" });

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

  const draftKey = (...parts: string[]) => parts.join("|");
  const draft = (key: string, fallback: string | number) => drafts[key] ?? String(fallback);
  const setDraft = (key: string, value: string) => setDrafts((d) => ({ ...d, [key]: value }));

  const inputCls =
    "w-24 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-white text-right";
  const btnCls =
    "rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-indigo-950 hover:bg-amber-200 transition";
  const cardCls = "mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md";

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[linear-gradient(168deg,#0a0e2a_0%,#171247_35%,#2a1a68_68%,#3d2384_100%)] px-5 py-16 text-slate-100">
        <div className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
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
    <div className="min-h-screen bg-[linear-gradient(168deg,#0a0e2a_0%,#171247_35%,#2a1a68_68%,#3d2384_100%)] px-5 py-10 text-slate-100 lg:px-12">
      <div className="mx-auto max-w-4xl">
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
            Loads the bundled seed data into Supabase (safe to re-run; keeps existing family tokens, edits, and
            votes).
          </p>
          <button onClick={() => run({ action: "seed" }, "Seeded ✨")} className={`${btnCls} mt-3`}>
            Seed database
          </button>
        </section>

        {/* Vote links */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Family vote links</h2>
          <p className="mt-1 text-sm text-slate-400">DM each family their own link — the link is their identity.</p>
          <div className="mt-3 space-y-2">
            {links.length === 0 && <p className="text-sm text-slate-500">No families in the database yet.</p>}
            {links.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="w-24 font-semibold text-white">{l.name}</span>
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

        {/* Flights */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Flight fares (per person, round trip)</h2>
          <p className="mt-1 text-sm text-slate-400">
            Saving a fare stamps today as the price-checked date and clears the estimate flag.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/15 text-left text-slate-300">
                  <th className="py-2">Option</th>
                  <th>Dates</th>
                  <th>Origin</th>
                  <th className="text-right">Fare</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.flights.map((f) => {
                  const opt = data.dateOptions.find((o) => o.id === f.optionId);
                  const key = draftKey("fl", f.optionId, f.origin);
                  return (
                    <tr key={key} className="border-b border-white/5">
                      <td className="py-1.5 font-bold text-amber-200">{f.optionId}</td>
                      <td className="text-xs text-slate-400">
                        {opt?.departDate.slice(5)} → {opt?.returnDate.slice(5)}
                      </td>
                      <td className="text-slate-200">{f.origin}</td>
                      <td className="text-right">
                        {f.estimate && <span className="mr-1 text-slate-500">~</span>}
                        <input
                          className={inputCls}
                          value={draft(key, f.farePerPerson)}
                          onChange={(e) => setDraft(key, e.target.value)}
                        />
                      </td>
                      <td className="pl-2 text-right">
                        <button
                          onClick={() =>
                            run(
                              {
                                action: "update-flight",
                                payload: {
                                  optionId: f.optionId,
                                  origin: f.origin,
                                  farePerPerson: Number(draft(key, f.farePerPerson)),
                                  estimate: false,
                                },
                              },
                              `Saved ${f.origin} fare for ${f.optionId} ✓`
                            )
                          }
                          className={btnCls}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Hotels */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Hotels</h2>
          <div className="mt-3 space-y-2">
            {data?.hotels.map((h) => {
              const nameKey = draftKey("hn", h.id);
              const rateKey = draftKey("hr", h.id);
              return (
                <div key={h.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    className="min-w-64 flex-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-white"
                    value={draft(nameKey, h.name)}
                    onChange={(e) => setDraft(nameKey, e.target.value)}
                  />
                  <span className="text-slate-400">$</span>
                  <input className={inputCls} value={draft(rateKey, h.nightlyRate)} onChange={(e) => setDraft(rateKey, e.target.value)} />
                  <span className="text-xs text-slate-500">/night</span>
                  <button
                    onClick={() =>
                      run(
                        {
                          action: "upsert-hotel",
                          payload: {
                            id: h.id,
                            name: draft(nameKey, h.name),
                            nightlyRate: Number(draft(rateKey, h.nightlyRate)),
                            breakfastIncluded: h.breakfastIncluded,
                            estimate: false,
                          },
                        },
                        `Saved ${h.id} ✓`
                      )
                    }
                    className={btnCls}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => run({ action: "delete-hotel", payload: { id: h.id } }, "Hotel removed")}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-pink-300 hover:bg-white/20"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-sm">
              <input
                placeholder="New hotel name"
                className="min-w-64 flex-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-white"
                value={newHotel.name}
                onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
              />
              <span className="text-slate-400">$</span>
              <input
                placeholder="rate"
                className={inputCls}
                value={newHotel.nightlyRate}
                onChange={(e) => setNewHotel({ ...newHotel, nightlyRate: e.target.value })}
              />
              <button
                onClick={() => {
                  if (!newHotel.name || !newHotel.nightlyRate) return;
                  run(
                    {
                      action: "upsert-hotel",
                      payload: { name: newHotel.name, nightlyRate: Number(newHotel.nightlyRate), breakfastIncluded: false, estimate: false },
                    },
                    "Hotel added ✓"
                  );
                  setNewHotel({ name: "", nightlyRate: "" });
                }}
                className={btnCls}
              >
                + Add hotel
              </button>
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Activity ticket prices</h2>
          <p className="mt-1 text-sm text-slate-400">Adult price also applies to kids 10+; kid price = ages 3–9.</p>
          <div className="mt-3 space-y-1.5">
            {data?.activities
              .filter((a) => a.adultPrice + a.childPrice > 0 || a.estimate)
              .map((a) => {
                const aKey = draftKey("aa", a.id);
                const cKey = draftKey("ac", a.id);
                return (
                  <div key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-56 flex-1 text-slate-200">
                      {a.star ? "⭐ " : ""}
                      {a.name}
                      {a.estimate && <span className="ml-1 text-xs text-slate-500">(~est.)</span>}
                    </span>
                    <span className="text-xs text-slate-500">adult $</span>
                    <input className={inputCls} value={draft(aKey, a.adultPrice)} onChange={(e) => setDraft(aKey, e.target.value)} />
                    <span className="text-xs text-slate-500">kid $</span>
                    <input className={inputCls} value={draft(cKey, a.childPrice)} onChange={(e) => setDraft(cKey, e.target.value)} />
                    <button
                      onClick={() =>
                        run(
                          {
                            action: "update-activity",
                            payload: { id: a.id, adultPrice: Number(draft(aKey, a.adultPrice)), childPrice: Number(draft(cKey, a.childPrice)), estimate: false },
                          },
                          `Saved ${a.name} ✓`
                        )
                      }
                      className={btnCls}
                    >
                      Save
                    </button>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Families */}
        <section className={cardCls}>
          <h2 className="font-bold text-white">Families</h2>
          <p className="mt-1 text-sm text-slate-400">Kids 3–9 get child ticket pricing; kids 10+ pay adult ticket prices.</p>
          <div className="mt-3 space-y-2">
            {data?.families.map((f) => {
              const keys = {
                name: draftKey("fn", f.id),
                adults: draftKey("fa", f.id),
                kids39: draftKey("fk", f.id),
                kids10: draftKey("fK", f.id),
                rooms: draftKey("fr", f.id),
              };
              return (
                <div key={f.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    className="w-40 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-white"
                    value={draft(keys.name, f.name)}
                    onChange={(e) => setDraft(keys.name, e.target.value)}
                  />
                  {(
                    [
                      ["adults", keys.adults, f.adults],
                      ["kids 3–9", keys.kids39, f.kids39],
                      ["kids 10+", keys.kids10, f.kids10plus],
                      ["rooms", keys.rooms, f.rooms],
                    ] as const
                  ).map(([label, key, val]) => (
                    <label key={key} className="flex items-center gap-1 text-xs text-slate-400">
                      {label}
                      <input className="w-12 rounded-lg border border-white/20 bg-white/10 px-1 py-1 text-center text-white" value={draft(key, val)} onChange={(e) => setDraft(key, e.target.value)} />
                    </label>
                  ))}
                  <button
                    onClick={() =>
                      run(
                        {
                          action: "update-family",
                          payload: {
                            id: f.id,
                            name: draft(keys.name, f.name),
                            adults: Number(draft(keys.adults, f.adults)),
                            kids39: Number(draft(keys.kids39, f.kids39)),
                            kids10plus: Number(draft(keys.kids10, f.kids10plus)),
                            rooms: Number(draft(keys.rooms, f.rooms)),
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
