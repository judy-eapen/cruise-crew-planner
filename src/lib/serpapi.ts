// Server-only SerpApi Google Flights client for the admin "Refresh fares" button.
// Every search is a same-airport round trip (X → MCO → X) by construction.
// Fares are round-trip totals per adult (kids 2+ pay the same). Bag fee is the
// $50/bag round-trip assumption for every airline (Southwest ended free bags in 2025).

import type { Origin } from "@/lib/types";

const ORIGINS: Origin[] = ["BWI", "DCA", "IAD"];
const BAG_FEE = 50;

export interface FareFilters {
  outboundTimes: string; // SerpApi hour window "10,19" = depart 10am-7pm ("" = any)
  returnTimes: string;
  nonstopOnly: boolean;
  excludeMax8: boolean;
  includeAirlines: string; // comma-separated IATA codes "DL,WN" ("" = all airlines)
}

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

const sanitizeAirlineCodes = (raw: string): string =>
  raw
    .toUpperCase()
    .split(",")
    .map((c) => c.trim())
    .filter((c) => /^[A-Z0-9]{2,3}$/.test(c))
    .join(",");

const usableItineraries = (json: any, f: FareFilters): any[] =>
  [...(json.best_flights ?? []), ...(json.other_flights ?? [])]
    .filter((it: any) => (it.flights?.length ?? 0) >= 1)
    .filter((it: any) => !f.nonstopOnly || it.flights.length === 1)
    .filter(
      (it: any) =>
        !f.excludeMax8 ||
        !it.flights.some((leg: any) => String(leg.airplane ?? "").toUpperCase().includes("MAX 8"))
    )
    .filter((it: any) => Number(it.price) > 0);

const isDeltaItin = (c: Candidate) => normalizeAirline(c.itin.flights[0].airline) === "Delta";

// First leg's airline; multi-leg itineraries get the stop count appended so the
// app (which normally speaks nonstop-only) stays honest about them.
const airlineLabel = (itin: any): string => {
  const base = normalizeAirline(itin.flights[0].airline);
  const stops = itin.flights.length - 1;
  return stops > 0 ? `${base} · ${stops} stop${stops > 1 ? "s" : ""}` : base;
};

/**
 * Fetch the top-N cheapest round trips (pooled across BWI/DCA/IAD → MCO) for one
 * date pair under the given filters, plus the cheapest Delta if it didn't make
 * the cut (skipped when an airline filter excludes DL).
 */
export async function fetchQuotesForOption(
  departDate: string,
  returnDate: string,
  filters: FareFilters,
  topN = 4
): Promise<OptionRefreshResult> {
  const warnings: string[] = [];
  let searches = 0;

  const baseParams: Record<string, string> = {
    outbound_date: departDate,
    return_date: returnDate,
    stops: filters.nonstopOnly ? "1" : "0", // SerpApi: 1 = nonstop only, 0 = any
  };
  if (/^\d{1,2},\d{1,2}$/.test(filters.outboundTimes)) baseParams.outbound_times = filters.outboundTimes;
  if (/^\d{1,2},\d{1,2}$/.test(filters.returnTimes)) baseParams.return_times = filters.returnTimes;
  const codes = sanitizeAirlineCodes(filters.includeAirlines);
  if (codes) baseParams.include_airlines = codes;

  const candidates: Candidate[] = [];
  for (const origin of ORIGINS) {
    try {
      const json = await serp({ departure_id: origin, ...baseParams });
      searches++;
      for (const itin of usableItineraries(json, filters)) candidates.push({ origin, itin });
    } catch (e) {
      searches++;
      warnings.push(`${origin}: ${e instanceof Error ? e.message : "search failed"}`);
    }
  }
  candidates.sort((a, b) => Number(a.itin.price) - Number(b.itin.price));

  const finalists = candidates.slice(0, topN);
  // Delta pin: base searches include all airlines, so an extra DL-only search is
  // only worth a credit when no Delta surfaced — and only if DL isn't filtered out.
  const deltaAllowed = !codes || codes.split(",").includes("DL");
  const cheapestDelta = candidates.find(isDeltaItin);
  if (cheapestDelta && !finalists.includes(cheapestDelta)) finalists.push(cheapestDelta);
  if (!cheapestDelta && deltaAllowed) {
    for (const origin of ORIGINS) {
      try {
        const json = await serp({ departure_id: origin, ...baseParams, include_airlines: "DL" });
        searches++;
        const itins = usableItineraries(json, filters);
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
    const legs = c.itin.flights;
    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];
    let retDepart = "TBD";
    let retArrive = "TBD";
    let price = Number(c.itin.price);
    if (c.itin.departure_token) {
      try {
        const json = await serp({
          departure_id: c.origin,
          ...baseParams,
          departure_token: String(c.itin.departure_token),
        });
        searches++;
        const rets = usableItineraries(json, filters).sort((a, b) => Number(a.price) - Number(b.price));
        if (rets.length) {
          const rLegs = rets[0].flights;
          retDepart = fmtTime(rLegs[0].departure_airport?.time);
          retArrive = fmtTime(rLegs[rLegs.length - 1].arrival_airport?.time);
          price = Number(rets[0].price);
        }
      } catch {
        searches++;
        warnings.push(`${c.origin} ${airlineLabel(c.itin)}: return-leg lookup failed (times TBD)`);
      }
    }
    quotes.push({
      origin: c.origin,
      airline: airlineLabel(c.itin),
      outDepart: fmtTime(firstLeg.departure_airport?.time),
      outArrive: fmtTime(lastLeg.arrival_airport?.time),
      retDepart,
      retArrive,
      duration: fmtDuration(c.itin.total_duration ?? firstLeg.duration),
      farePerPerson: price,
      bagFee: BAG_FEE,
      isDelta: normalizeAirline(firstLeg.airline) === "Delta",
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
