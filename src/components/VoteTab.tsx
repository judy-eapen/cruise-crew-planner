"use client";

export default function VoteTab() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center backdrop-blur-md">
      <p className="text-5xl">🗳️✨</p>
      <h2 className="mt-3 text-xl font-bold text-white">Family voting — coming soon</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-300">
        Each family will get their own private vote link (no logins, no dropdowns — your link is your
        identity). One vote per family, editable until we book, with live results everyone can see.
      </p>
      <p className="mt-5 text-xs text-slate-500">Ships once the database wiring lands (v1).</p>
    </div>
  );
}
