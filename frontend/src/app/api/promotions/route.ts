import { NextRequest, NextResponse } from "next/server";
import { dbGetPromotions, dbCreatePromotion } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isActiveParam = searchParams.get("is_active");
    const isActiveOnly = isActiveParam === "true" || isActiveParam === "1";

    const promos = await dbGetPromotions(isActiveOnly);
    return NextResponse.json(promos);
  } catch (err: any) {
    console.error("API GET /api/promotions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.promo_code) {
      return NextResponse.json({ error: "Title and Promo Code are required." }, { status: 400 });
    }

    const promo = await dbCreatePromotion(body);
    if (!promo) {
      return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
    }
    return NextResponse.json({ message: "Promotion created successfully", promotion: promo });
  } catch (err: any) {
    console.error("API POST /api/promotions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
