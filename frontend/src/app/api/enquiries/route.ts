import { NextRequest, NextResponse } from "next/server";
import { dbGetEnquiries, dbCreateEnquiry } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    try {
      const enquiries = await dbGetEnquiries({ status, search, limit });
      return NextResponse.json(enquiries);
    } catch (e: any) {
      console.warn("API GET /api/enquiries error from db:", e.message || e);
      const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:8000" : null);
      if (backendBase) {
        try {
          let url = `${backendBase}/api/enquiries`;
          const q: string[] = [];
          if (status) q.push(`status=${encodeURIComponent(status)}`);
          if (search) q.push(`search=${encodeURIComponent(search)}`);
          if (limit) q.push(`limit=${limit}`);
          if (q.length > 0) url += `?${q.join("&")}`;
          const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2000) });
          if (res.ok) return NextResponse.json(await res.json());
        } catch {}
      }
      return NextResponse.json([]);
    }
  } catch (err: any) {
    console.error("API GET /api/enquiries error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const enquiry = await dbCreateEnquiry(body);
    if (!enquiry) {
      return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
    }
    return NextResponse.json({ enquiry });
  } catch (err: any) {
    console.error("API POST /api/enquiries error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
