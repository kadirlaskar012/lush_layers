import { NextRequest, NextResponse } from "next/server";
import { dbCheckPhoneEligibility } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const code = searchParams.get("code") || undefined;

    if (!phone) {
      return NextResponse.json({
        is_valid_phone: false,
        is_new_user: false,
        eligible: false,
        message: "Phone number is required."
      }, { status: 400 });
    }

    const result = await dbCheckPhoneEligibility(phone, code);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API GET /api/promotions/check-phone error:", err);
    return NextResponse.json({
      is_valid_phone: false,
      is_new_user: false,
      eligible: false,
      message: err.message || "Failed to verify phone eligibility"
    }, { status: 500 });
  }
}
