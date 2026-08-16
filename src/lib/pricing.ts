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
  activityDays: number; // full = 1, half = 0.5
  anyEstimate: boolean;
}

export function partyFromFamily(f: Family): PartySize {
  return { adults: f.adults, kids39: f.kids39, kids10plus: f.kids10plus, rooms: f.rooms, bags: f.bags };
}

export function totalPeople(p: PartySize): number {
  return p.adults + p.kids39 + p.kids10plus;
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

/** The specific nightly rates a segment uses (pre: Oct 31/Nov 1; post: Nov 6/Nov 7). */
export function segmentNightRates(hotel: Hotel, segment: "pre" | "post", nights: number): { label: string; rate: number }[] {
  if (nights <= 0) return [];
  if (segment === "pre") {
    return nights >= 2
      ? [
          { label: "Oct 31", rate: hotel.rateOct31 },
          { label: "Nov 1", rate: hotel.rateNov1 },
        ]
      : [{ label: "Nov 1", rate: hotel.rateNov1 }];
  }
  return nights >= 2
    ? [
        { label: "Nov 6", rate: hotel.rateNov6 },
        { label: "Nov 7", rate: hotel.rateNov7 },
      ]
    : [{ label: "Nov 6", rate: hotel.rateNov6 }];
}

/** Cost of a hotel segment for a party — priced night by night. */
export function hotelSegmentCost(
  hotel: Hotel,
  segment: "pre" | "post",
  nights: number,
  party: PartySize,
  familyCount: number
): number {
  const sum = segmentNightRates(hotel, segment, nights).reduce((t, n) => t + n.rate, 0);
  if (sum <= 0) return 0;
  if (hotel.priceMode === "per_property_night_split") {
    return Math.round(sum / Math.max(1, familyCount));
  }
  return sum * party.rooms;
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
  const familyCount = Math.max(1, data.families.length);

  // Flights (kids 2+ pay adult airfare) + checked bags
  const bagsCost = quote ? quote.bagFee * party.bags : 0;
  const flights = quote ? quoteCostForParty(quote, party) : 0;

  // Hotels — two segments
  const preHotel = data.hotels.find((h) => h.id === build.preHotelId) ?? data.hotels[0];
  const postHotel = data.hotels.find((h) => h.id === build.postHotelId) ?? data.hotels[0];
  const hotel =
    (preHotel ? hotelSegmentCost(preHotel, "pre", option.preNights, party, familyCount) : 0) +
    (postHotel ? hotelSegmentCost(postHotel, "post", option.postNights, party, familyCount) : 0);

  // Activity tickets — adults + kids 10+ pay adult price; kids 3–9 pay child price
  let tickets = 0;
  let anyEstimate = Boolean(quote?.estimate) || Boolean(preHotel?.estimate && option.preNights > 0) || Boolean(postHotel?.estimate && option.postNights > 0);
  let activityDays = 0;
  for (const slot of data.slots.filter((s) => s.optionId === optionId)) {
    if (slot.slotType === "full") activityDays += 1;
    else if (slot.slotType === "half") activityDays += 0.5;
    if (slot.slotType === "travel") continue;
    const actId = build.activities[slot.date];
    if (!actId) continue;
    const act = data.activities.find((a) => a.id === actId);
    if (!act) continue;
    tickets += act.adultPrice * (party.adults + party.kids10plus) + act.childPrice * party.kids39;
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
