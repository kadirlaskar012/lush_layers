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
    } catch (e: any) {
      console.warn("API GET /api/system/status error from db:", e.message || e);
      const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:8000" : null);
      if (backendBase) {
        try {
          const res = await fetch(`${backendBase}/api/system/status`, { cache: "no-store", signal: AbortSignal.timeout(2000) });
          if (res.ok) return NextResponse.json(await res.json());
        } catch {}
      }
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
