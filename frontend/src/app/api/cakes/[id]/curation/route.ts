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
    
    let cake: any = null;
    try {
      cake = await dbUpdateCakeCuration(id, body);
    } catch (dbErr: any) {
      console.warn("Supabase curation update failed, falling back to local backend:", dbErr.message);
    }

    // Also sync to local backend if running
    try {
      const res = await fetch(`http://localhost:8000/api/cakes/${id}/curation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!cake && res.ok) {
        const data = await res.json();
        cake = data.cake;
      }
    } catch {}

    if (!cake) {
      throw new Error("Failed to update cake curation on database.");
    }

    return NextResponse.json({ message: "Curation updated", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
