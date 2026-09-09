import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbBulkUpdateCakeStatus, dbBulkDeleteCakes } from "@/lib/db";
import { invalidateServerCache } from "@/lib/serverData";
import { syncCakeActionToLocal } from "@/lib/syncLocal";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No cake IDs provided" }, { status: 400 });
    }

    if (action === "delete") {
      const deletedCount = await dbBulkDeleteCakes(ids);
      // Sync each deletion to local backend if running
      ids.forEach((id: string) => syncCakeActionToLocal(id, "delete").catch(() => {}));

      invalidateServerCache("cakes");
      try {
        revalidatePath("/", "layout");
        revalidatePath("/cakes");
      } catch {}

      return NextResponse.json({
        success: true,
        action: "delete",
        count: deletedCount,
        message: `${deletedCount} ${deletedCount === 1 ? "cake" : "cakes"} permanently deleted.`,
      });
    }

    // Status action
    const targetStatus = status || (action === "approve" ? "approved" : action === "publish" ? "published" : action === "reject" ? "rejected" : action === "restore" ? "pending" : action === "unpublish" ? "approved" : null);

    if (!targetStatus) {
      return NextResponse.json({ error: "Target status not specified" }, { status: 400 });
    }

    const updatedCakes = await dbBulkUpdateCakeStatus(ids, targetStatus);
    const syncAction = (targetStatus === "published" ? "publish" : targetStatus === "approved" ? "approve" : targetStatus === "rejected" ? "reject" : "restore") as any;

    ids.forEach((id: string) => syncCakeActionToLocal(id, syncAction).catch(() => {}));

    invalidateServerCache("cakes");
    try {
      revalidatePath("/", "layout");
      revalidatePath("/cakes");
    } catch {}

    return NextResponse.json({
      success: true,
      action: "status",
      status: targetStatus,
      count: updatedCakes.length,
      cakes: updatedCakes,
      message: `${updatedCakes.length} ${updatedCakes.length === 1 ? "cake" : "cakes"} updated to "${targetStatus}".`,
    });
  } catch (err: any) {
    console.error("API POST /api/cakes/bulk error:", err);
    return NextResponse.json({ error: err.message || "Failed to perform bulk operation" }, { status: 500 });
  }
}
