import { NextRequest, NextResponse } from "next/server";
import { dbGetPromotionById, dbUpdatePromotion, dbDeletePromotion } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const promo = await dbGetPromotionById(id);
    if (!promo) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }
    return NextResponse.json(promo);
  } catch (err: any) {
    console.error("API GET /api/promotions/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await dbUpdatePromotion(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Promotion not found or update failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Promotion updated successfully", promotion: updated });
  } catch (err: any) {
    console.error("API PUT /api/promotions/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await dbDeletePromotion(id);
    if (!ok) {
      return NextResponse.json({ error: "Promotion not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Promotion deleted successfully" });
  } catch (err: any) {
    console.error("API DELETE /api/promotions/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
