import type {
  Build,
  DateOption,
  Family,
  FlightQuote,
  Hotel,
  OptionId,
  TripData,
} from "@/lib/types";

export interface PartySize {
  adults: number;
  kids39: number;
  kids10plus: number;
  rooms: number;
  bags: number;
}

export interface BuildCost {
  option: DateOption;
  quote: FlightQuote | null;
  flights: number;
  bagsCost: number; // included in flights, broken out for display
  hotel: number;
  tickets: number;
  total: number;
  perPerson: number;
  activityDays: number; // FULL free days only — travel-day halves don't count
  anyEstimate: boolean;
}

export function partyFromFamily(f: Family): PartySize {
  return { adults: f.adults, kids39: f.kids39, kids10plus: f.kids10plus, rooms: f.rooms, bags: f.bags };
}

export function totalPeople(p: PartySize): number {
  return p.adults + p.kids39 + p.kids10plus;
}

/** Ticket prices for an activity on a specific date (Disney calendar pricing), falling back to base. */
export function activityPrices(act: { adultPrice: number; childPrice: number; datePrices?: Record<string, { adult: number; child: number }> }, date?: string) {
  const o = date ? act.datePrices?.[date] : undefined;
  return { adult: o?.adult ?? act.adultPrice, child: o?.child ?? act.childPrice };
}

/** What a party pays for one activity on one date. */
export function activityCostForParty(
  act: { adultPrice: number; childPrice: number; datePrices?: Record<string, { adult: number; child: number }> },
  party: PartySize,
  date?: string
): number {
  const p = activityPrices(act, date);
  return p.adult * (party.adults + party.kids10plus) + p.child * party.kids39;
}

export function quotesForOption(data: TripData, optionId: OptionId): FlightQuote[] {
  return data.flights
    .filter((f) => f.optionId === optionId)
    .sort((a, b) => a.farePerPerson - b.farePerPerson);
}

/** Cost of one flight quote for a party: fares for everyone + bag fees. */
export function quoteCostForParty(q: FlightQuote, party: PartySize): number {
  return q.farePerPerson * totalPeople(party) + q.bagFee * party.bags;
}

/** The exact stay a segment books, with its as-quoted total. */
export function segmentStay(hotel: Hotel, segment: "pre" | "post", nights: number): { label: string; total: number } | null {
  if (nights <= 0) return null;
  if (segment === "pre") {
    return nights >= 2
      ? { label: "Oct 31 → Nov 2 (2 nts)", total: hotel.stayPre2 }
      : { label: "Nov 1 → Nov 2 (1 nt)", total: hotel.stayPre1 };
  }
  return nights >= 2
    ? { label: "Nov 6 → Nov 8 (2 nts)", total: hotel.stayPost2 }
    : { label: "Nov 6 → Nov 7 (1 nt)", total: hotel.stayPost1 };
}

/** Cost of a hotel segment for a party — the as-quoted stay total. */
export function hotelSegmentCost(
  hotel: Hotel,
  segment: "pre" | "post",
  nights: number,
  party: PartySize
): number {
  const stay = segmentStay(hotel, segment, nights);
  if (!stay || stay.total <= 0) return 0;
  if (hotel.priceMode === "per_property_night_split") {
    return Math.round(stay.total / Math.max(1, hotel.sharedFamilies));
  }
  return stay.total * party.rooms;
}

/** Properties offered for a segment: those with a real price for that window. */
export function hotelsForSegment(hotels: Hotel[], segment: "pre" | "post", nights: number): Hotel[] {
  return hotels.filter((h) => (segmentStay(h, segment, nights)?.total ?? 0) > 0);
}

/** The organizer's suggested configuration: cheapest flight, first hotel, sample activities. */
export function defaultBuild(data: TripData, optionId: OptionId): Build {
  const option = data.dateOptions.find((o) => o.id === optionId)!;
  const quotes = quotesForOption(data, optionId);
  const activities: Record<string, string | null> = {};
  for (const s of data.slots) {
    if (s.optionId === optionId && s.slotType !== "travel") activities[s.date] = s.activityId;
  }
  return {
    flightId: quotes[0]?.id ?? null,
    preHotelId: option.preNights > 0 ? (data.hotels[0]?.id ?? null) : null,
    postHotelId: option.postNights > 0 ? (data.hotels[0]?.id ?? null) : null,
    activities,
  };
}

export function costForBuild(data: TripData, optionId: OptionId, build: Build, party: PartySize): BuildCost {
  const option = data.dateOptions.find((o) => o.id === optionId)!;
  const quotes = quotesForOption(data, optionId);
  const quote = quotes.find((q) => q.id === build.flightId) ?? quotes[0] ?? null;

  // Flights (kids 2+ pay adult airfare) + checked bags
  const bagsCost = quote ? quote.bagFee * party.bags : 0;
  const flights = quote ? quoteCostForParty(quote, party) : 0;

  // Hotels — two segments
  const preHotel = data.hotels.find((h) => h.id === build.preHotelId) ?? data.hotels[0];
  const postHotel = data.hotels.find((h) => h.id === build.postHotelId) ?? data.hotels[0];
  const hotel =
    (preHotel ? hotelSegmentCost(preHotel, "pre", option.preNights, party) : 0) +
    (postHotel ? hotelSegmentCost(postHotel, "post", option.postNights, party) : 0);

  // Activity tickets — adults + kids 10+ pay adult price; kids 3–9 pay child price
  let tickets = 0;
  let anyEstimate = Boolean(quote?.estimate) || Boolean(preHotel?.estimate && option.preNights > 0) || Boolean(postHotel?.estimate && option.postNights > 0);
  let activityDays = 0;
  for (const slot of data.slots.filter((s) => s.optionId === optionId)) {
    // Free days = FULL days only; arrival/departure half-days are travel days
    // (still plannable below, but they don't count).
    if (slot.slotType === "full") activityDays += 1;
    if (slot.slotType === "travel") continue;
    const actId = build.activities[slot.date];
    if (!actId) continue;
    const act = data.activities.find((a) => a.id === actId);
    if (!act) continue;
    tickets += activityCostForParty(act, party, slot.date);
    if (act.estimate && act.adultPrice + act.childPrice > 0) anyEstimate = true;
  }

  const total = flights + hotel + tickets;
  return {
    option,
    quote,
    flights,
    bagsCost,
    hotel,
    tickets,
    total,
    perPerson: Math.round(total / Math.max(1, totalPeople(party))),
    activityDays,
    anyEstimate,
  };
}

export const fmt = (n: number) => "$" + n.toLocaleString("en-US");
