"use client";

// A fixed, full-viewport watermark of slow firework bursts in the brand colors.
// pointer-events-none + low opacity: pure ambience, never competes with content.

const BURSTS = [
  { top: "6%", left: "12%", color: "text-amber-300", delay: 0, dur: 3.4, scale: 0.9 },
  { top: "14%", left: "78%", color: "text-pink-400", delay: 1.1, dur: 3.8, scale: 1.1 },
  { top: "30%", left: "40%", color: "text-cyan-300", delay: 2.3, dur: 3.2, scale: 0.7 },
  { top: "42%", left: "90%", color: "text-fuchsia-400", delay: 0.6, dur: 4.2, scale: 0.8 },
  { top: "55%", left: "6%", color: "text-pink-400", delay: 1.8, dur: 3.6, scale: 1.0 },
  { top: "64%", left: "62%", color: "text-amber-300", delay: 3.0, dur: 3.9, scale: 0.6 },
  { top: "78%", left: "25%", color: "text-cyan-300", delay: 0.3, dur: 4.4, scale: 0.9 },
  { top: "88%", left: "82%", color: "text-amber-300", delay: 2.6, dur: 3.5, scale: 0.75 },
];

export default function FireworksBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30" aria-hidden="true">
      {BURSTS.map((b, i) => (
        <div key={i} className="absolute" style={{ top: b.top, left: b.left, transform: `scale(${b.scale})` }}>
          <div
            className={`firework ${b.color}`}
            style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
          />
        </div>
      ))}
    </div>
  );
}
