import type { DateOption, Family, OptionId, Origin, TripData } from "@/lib/types";

export interface PartySize {
  adults: number;
  kids39: number;
  kids10plus: number;
  rooms: number;
}

export interface OptionCost {
  option: DateOption;
  flights: number;
  hotel: number;
  tickets: number;
  total: number;
  perPerson: number;
  activityDays: number; // full = 1, half = 0.5
  anyEstimate: boolean;
}

export function partyFromFamily(f: Family): PartySize {
  return { adults: f.adults, kids39: f.kids39, kids10plus: f.kids10plus, rooms: f.rooms };
}

export function totalPeople(p: PartySize): number {
  return p.adults + p.kids39 + p.kids10plus;
}

export function costForOption(
  data: TripData,
  optionId: OptionId,
  origin: Origin,
  hotelId: string,
  party: PartySize
): OptionCost {
  const option = data.dateOptions.find((o) => o.id === optionId)!;
  const flight = data.flights.find((f) => f.optionId === optionId && f.origin === origin)!;
  const hotel = data.hotels.find((h) => h.id === hotelId) ?? data.hotels[0];
  const slots = data.slots.filter((s) => s.optionId === optionId);

  // BR-1: kids 2+ pay adult airfare — everyone pays farePerPerson
  const flights = flight.farePerPerson * totalPeople(party);

  // BR-2
  const hotelCost = hotel.nightlyRate * option.hotelNights * party.rooms;

  // BR-3: adults + kids 10+ pay adult ticket price; kids 3–9 pay child price
  let tickets = 0;
  let anyEstimate = flight.estimate || hotel.estimate;
  let activityDays = 0;
  for (const slot of slots) {
    if (slot.slotType === "full") activityDays += 1;
    else if (slot.slotType === "half") activityDays += 0.5;
    if (!slot.activityId) continue;
    const act = data.activities.find((a) => a.id === slot.activityId);
    if (!act) continue;
    tickets += act.adultPrice * (party.adults + party.kids10plus) + act.childPrice * party.kids39;
    if (act.estimate && act.adultPrice + act.childPrice > 0) anyEstimate = true;
  }

  const total = flights + hotelCost + tickets;
  return {
    option,
    flights,
    hotel: hotelCost,
    tickets,
    total,
    perPerson: Math.round(total / Math.max(1, totalPeople(party))),
    activityDays,
    anyEstimate,
  };
}

export function costsForAllOptions(
  data: TripData,
  origin: Origin,
  hotelId: string,
  party: PartySize
): OptionCost[] {
  return data.dateOptions.map((o) => costForOption(data, o.id, origin, hotelId, party));
}

export const fmt = (n: number) => "$" + n.toLocaleString("en-US");
