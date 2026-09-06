import { NextResponse } from "next/server";
import { dbGetAdminStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await dbGetAdminStats();
    return NextResponse.json({
      success: true,
      status: "operational",
      mode: "cloud_direct",
      stats,
    });
  } catch (err: any) {
    console.error("API GET /api/system/status error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
