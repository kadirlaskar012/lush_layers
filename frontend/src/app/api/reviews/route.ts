import { NextRequest, NextResponse } from "next/server";
import { dbGetReviews, dbSubmitReview } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "approved";
    const reviews = await dbGetReviews(status);
    return NextResponse.json(reviews);
  } catch (err: any) {
    console.error("API GET /api/reviews error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await dbSubmitReview(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
