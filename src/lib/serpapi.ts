// Server-only SerpApi Google Flights client for the admin "Refresh fares" button.
// Fares are round-trip totals per adult (kids 2+ pay the same), nonstop only,
// 737 MAX 8 itineraries dropped (scheduled equipment — airlines can swap planes).

import type { Origin } from "@/lib/types";

const ORIGINS: Origin[] = ["BWI", "DCA", "IAD"];

export interface FetchedQuote {
  origin: Origin;
  airline: string;
  outDepart: string;
  outArrive: string;
  retDepart: string;
  retArrive: string;
  duration: string;
  farePerPerson: number;
  bagFee: number;
  isDelta: boolean;
}

export interface OptionRefreshResult {
  quotes: FetchedQuote[];
  searches: number;
  warnings: string[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Candidate {
  origin: Origin;
  itin: any;
}

async function serp(params: Record<string, string>): Promise<any> {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error("SERPAPI_KEY is not configured (set it in Vercel env vars and redeploy)");
  const qs = new URLSearchParams({
    engine: "google_flights",
    arrival_id: "MCO",
    currency: "USD",
    hl: "en",
    adults: "1",
    stops: "1", // SerpApi's value for nonstop-only
    api_key: key,
    ...params,
  });
  const res = await fetch(`https://serpapi.com/search.json?${qs}`, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error ?? `SerpApi HTTP ${res.status}`);
  return json;
}

// "2026-10-31 07:05" → "7:05 AM"
const fmtTime = (t: string | undefined): string => {
  if (!t || t.length < 16) return "TBD";
  const h = Number(t.slice(11, 13));
  const m = t.slice(14, 16);
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
};

const fmtDuration = (mins: number | undefined): string =>
  mins && mins > 0 ? `~${Math.floor(mins / 60)}h ${mins % 60}m` : "~2h 15m";

// Match the naming of hand-entered rows: "Delta", "United", "Southwest", "Frontier"…
const normalizeAirline = (name: string | undefined): string =>
  (name ?? "Unknown").replace(/\s+Air\s*Lines?$/i, "").replace(/\s+Airways$/i, "").trim();

const usableItineraries = (json: any): any[] =>
  [...(json.best_flights ?? []), ...(json.other_flights ?? [])]
    .filter((it: any) => (it.flights?.length ?? 0) === 1) // nonstop = single leg
    .filter((it: any) => !String(it.flights[0].airplane ?? "").toUpperCase().includes("MAX 8"))
    .filter((it: any) => Number(it.price) > 0);

const isDeltaItin = (c: Candidate) => normalizeAirline(c.itin.flights[0].airline) === "Delta";

/**
 * Fetch the top-5 cheapest nonstop round trips (pooled across BWI/DCA/IAD → MCO)
 * for one date pair, plus the cheapest Delta if it didn't make the cut.
 * Time windows are SerpApi hour ranges like "6,12" (depart between 6am and noon).
 */
export async function fetchQuotesForOption(
  departDate: string,
  returnDate: string,
  outboundTimes: string,
  returnTimes: string,
  topN = 4
): Promise<OptionRefreshResult> {
  const warnings: string[] = [];
  let searches = 0;
  const timeParams: Record<string, string> = {};
  if (/^\d{1,2},\d{1,2}$/.test(outboundTimes)) timeParams.outbound_times = outboundTimes;
  if (/^\d{1,2},\d{1,2}$/.test(returnTimes)) timeParams.return_times = returnTimes;

  const candidates: Candidate[] = [];
  for (const origin of ORIGINS) {
    try {
      const json = await serp({
        departure_id: origin,
        outbound_date: departDate,
        return_date: returnDate,
        ...timeParams,
      });
      searches++;
      for (const itin of usableItineraries(json)) candidates.push({ origin, itin });
    } catch (e) {
      searches++;
      warnings.push(`${origin}: ${e instanceof Error ? e.message : "search failed"}`);
    }
  }
  candidates.sort((a, b) => Number(a.itin.price) - Number(b.itin.price));

  const finalists = candidates.slice(0, topN);
  // Delta pin: the base searches include all airlines, so an extra DL-only search
  // is only worth a credit if no Delta itinerary surfaced at all.
  const cheapestDelta = candidates.find(isDeltaItin);
  if (cheapestDelta && !finalists.includes(cheapestDelta)) finalists.push(cheapestDelta);
  if (!cheapestDelta) {
    for (const origin of ORIGINS) {
      try {
        const json = await serp({
          departure_id: origin,
          outbound_date: departDate,
          return_date: returnDate,
          include_airlines: "DL",
          ...timeParams,
        });
        searches++;
        const itins = usableItineraries(json);
        if (itins.length) {
          finalists.push({ origin, itin: itins[0] });
          break;
        }
      } catch {
        searches++;
      }
    }
  }

  // Resolve return-leg times (and the true round-trip total) via departure_token.
  const quotes: FetchedQuote[] = [];
  for (const c of finalists) {
    const out = c.itin.flights[0];
    let retDepart = "TBD";
    let retArrive = "TBD";
    let price = Number(c.itin.price);
    if (c.itin.departure_token) {
      try {
        const json = await serp({
          departure_id: c.origin,
          outbound_date: departDate,
          return_date: returnDate,
          departure_token: String(c.itin.departure_token),
          ...timeParams,
        });
        searches++;
        const rets = usableItineraries(json).sort((a, b) => Number(a.price) - Number(b.price));
        if (rets.length) {
          const leg = rets[0].flights[0];
          retDepart = fmtTime(leg.departure_airport?.time);
          retArrive = fmtTime(leg.arrival_airport?.time);
          price = Number(rets[0].price);
        }
      } catch {
        searches++;
        warnings.push(`${c.origin} ${normalizeAirline(out.airline)}: return-leg lookup failed (times TBD)`);
      }
    }
    const airline = normalizeAirline(out.airline);
    quotes.push({
      origin: c.origin,
      airline,
      outDepart: fmtTime(out.departure_airport?.time),
      outArrive: fmtTime(out.arrival_airport?.time),
      retDepart,
      retArrive,
      duration: fmtDuration(out.duration),
      farePerPerson: price,
      bagFee: airline === "Southwest" ? 0 : 50,
      isDelta: airline === "Delta",
    });
  }
  // Dedupe (Delta pin can duplicate a finalist after return resolution)
  const seen = new Set<string>();
  const unique = quotes.filter((q) => {
    const k = `${q.origin}|${q.airline}|${q.outDepart}|${q.retDepart}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return { quotes: unique, searches, warnings };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
