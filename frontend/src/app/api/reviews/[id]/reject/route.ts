import { NextRequest, NextResponse } from "next/server";
import { dbUpdateReviewStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await dbUpdateReviewStatus(id, "rejected");
    return NextResponse.json({ success: ok, message: "Review rejected" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
