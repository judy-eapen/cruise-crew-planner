import { NextResponse } from "next/server";
import { getTripData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getTripData();
  return NextResponse.json(data);
}
