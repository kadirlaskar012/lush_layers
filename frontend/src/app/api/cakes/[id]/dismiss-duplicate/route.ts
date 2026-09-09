import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbDismissCakeDuplicate } from "@/lib/db";
import { invalidateServerCache } from "@/lib/serverData";
import { syncCakeActionToLocal } from "@/lib/syncLocal";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cake = await dbDismissCakeDuplicate(id);
    
    // Sync dismiss duplicate to local Python backend
    await syncCakeActionToLocal(id, "dismiss-duplicate");

    invalidateServerCache("cakes");
    revalidatePath("/");
    revalidatePath("/cakes");
    return NextResponse.json({ message: "Duplicate dismissed", cake });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
