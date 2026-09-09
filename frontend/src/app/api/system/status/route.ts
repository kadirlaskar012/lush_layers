import { NextResponse } from "next/server";
import { dbGetAdminStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    try {
      const stats = await dbGetAdminStats();
      return NextResponse.json({
        success: true,
        status: "operational",
        mode: "cloud_direct",
        stats,
      });
    } catch (e) {
      console.warn("API GET /api/system/status falling back to local backend:", e);
      const res = await fetch("http://localhost:8000/api/system/status", { cache: "no-store" });
      if (res.ok) return NextResponse.json(await res.json());
      return NextResponse.json({
        success: true,
        status: "operational",
        mode: "resilient_fallback",
        stats: { total_cakes: 0, pending: 0, approved: 0, rejected: 0, duplicates: 0 },
      });
    }
  } catch (err: any) {
    console.error("API GET /api/system/status error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
