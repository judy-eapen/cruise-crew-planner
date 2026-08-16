"use client";

// A fixed, full-viewport watermark of slow firework bursts in the brand colors.
// pointer-events-none + low opacity: pure ambience, never competes with content.

const BURSTS = [
  { top: "5%", left: "10%", color: "text-amber-200", delay: 0, dur: 3.4, scale: 1.4 },
  { top: "12%", left: "80%", color: "text-pink-300", delay: 1.1, dur: 3.8, scale: 1.7 },
  { top: "22%", left: "45%", color: "text-cyan-200", delay: 2.3, dur: 3.2, scale: 1.1 },
  { top: "34%", left: "93%", color: "text-fuchsia-300", delay: 0.6, dur: 4.2, scale: 1.3 },
  { top: "40%", left: "20%", color: "text-amber-200", delay: 3.4, dur: 3.7, scale: 1.0 },
  { top: "52%", left: "5%", color: "text-pink-300", delay: 1.8, dur: 3.6, scale: 1.6 },
  { top: "58%", left: "70%", color: "text-cyan-200", delay: 2.9, dur: 4.0, scale: 1.2 },
  { top: "68%", left: "38%", color: "text-amber-200", delay: 0.9, dur: 3.9, scale: 0.9 },
  { top: "74%", left: "92%", color: "text-pink-300", delay: 3.8, dur: 3.4, scale: 1.4 },
  { top: "84%", left: "15%", color: "text-cyan-200", delay: 0.3, dur: 4.4, scale: 1.5 },
  { top: "90%", left: "60%", color: "text-fuchsia-300", delay: 2.0, dur: 3.6, scale: 1.1 },
  { top: "96%", left: "85%", color: "text-amber-200", delay: 1.4, dur: 3.5, scale: 1.2 },
];

export default function FireworksBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-60" aria-hidden="true">
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
