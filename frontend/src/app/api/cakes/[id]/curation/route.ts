import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbUpdateCakeCuration } from "@/lib/db";
import { invalidateServerCache } from "@/lib/serverData";

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

    // Also sync to local backend if running in dev or configured
    const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:8000" : null);
    if (backendBase) {
      try {
        const res = await fetch(`${backendBase}/api/cakes/${id}/curation`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(2000),
        });
        if (!cake && res.ok) {
          const data = await res.json();
          cake = data.cake;
        }
      } catch {}
    }

    if (!cake) {
      throw new Error("Failed to update cake curation on database.");
    }

    invalidateServerCache("cakes");
    revalidatePath("/");
    revalidatePath("/cakes");

    return NextResponse.json({ message: "Curation updated", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
