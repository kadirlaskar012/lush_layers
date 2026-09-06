import { NextRequest, NextResponse } from "next/server";
import { dbDismissCakeDuplicate } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cake = await dbDismissCakeDuplicate(id);
    return NextResponse.json({ message: "Duplicate dismissed", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
