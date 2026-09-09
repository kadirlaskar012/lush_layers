import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbUpdateCakeStatus } from "@/lib/db";
import { invalidateServerCache } from "@/lib/serverData";
import { syncCakeActionToLocal } from "@/lib/syncLocal";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cake = await dbUpdateCakeStatus(id, "pending");
    
    // Sync restore to local Python backend
    await syncCakeActionToLocal(id, "restore");

    invalidateServerCache("cakes");
    revalidatePath("/");
    revalidatePath("/cakes");
    return NextResponse.json({ message: "Cake restored", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
