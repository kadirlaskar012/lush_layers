import { NextResponse } from "next/server";
import { dbGetDuplicateCakes } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cakes = await dbGetDuplicateCakes();
    return NextResponse.json(cakes);
  } catch (err: any) {
    console.error("API GET /api/cakes/duplicates error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
