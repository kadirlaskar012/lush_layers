import { NextRequest, NextResponse } from "next/server";
import { dbGetEnquiries, dbCreateEnquiry } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const enquiries = await dbGetEnquiries({ status, search, limit });
    return NextResponse.json(enquiries);
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
