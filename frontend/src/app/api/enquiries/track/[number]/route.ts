import { NextRequest, NextResponse } from "next/server";
import { dbGetEnquiryByNumber } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const enquiry = await dbGetEnquiryByNumber(number);
    if (!enquiry) {
      return NextResponse.json({ error: "Order enquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ enquiry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
