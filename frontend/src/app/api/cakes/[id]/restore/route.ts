import { NextRequest, NextResponse } from "next/server";
import { dbUpdateCakeStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cake = await dbUpdateCakeStatus(id, "pending");
    return NextResponse.json({ message: "Cake restored", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
