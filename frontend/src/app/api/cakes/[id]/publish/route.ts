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
    const cake = await dbUpdateCakeStatus(id, "published");
    
    // Sync publish to local Python backend
    await syncCakeActionToLocal(id, "publish");

    invalidateServerCache("cakes");
    revalidatePath("/");
    revalidatePath("/cakes");
    revalidatePath("/categories");
    return NextResponse.json({ message: "Cake published", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
