// Date helpers — all math on ISO strings at UTC noon to dodge timezone drift.

/** Google Flights pre-loaded with this round trip — the booking jump-off for any quote. */
export function googleFlightsUrl(origin: string, departDate: string, returnDate: string): string {
  const q = `Flights from ${origin} to MCO on ${departDate} through ${returnDate} nonstop`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

export function isoRange(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  const d = new Date(startIso + "T12:00:00Z");
  const end = new Date(endIso + "T12:00:00Z");
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export function shortDay(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function shortDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
