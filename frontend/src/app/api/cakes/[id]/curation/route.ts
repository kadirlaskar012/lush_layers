import { NextRequest, NextResponse } from "next/server";
import { dbUpdateCakeCuration } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const cake = await dbUpdateCakeCuration(id, body);
    return NextResponse.json({ message: "Curation updated", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
