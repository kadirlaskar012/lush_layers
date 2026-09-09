import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbBulkUpdateReviewStatus, dbBulkDeleteReviews } from "@/lib/db";
import { invalidateServerCache } from "@/lib/serverData";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No review IDs provided" }, { status: 400 });
    }

    if (action === "delete") {
      const deletedCount = await dbBulkDeleteReviews(ids);
      invalidateServerCache("reviews");
      try {
        revalidatePath("/reviews");
        revalidatePath("/");
      } catch {}

      return NextResponse.json({
        success: true,
        action: "delete",
        count: deletedCount,
        message: `${deletedCount} ${deletedCount === 1 ? "review" : "reviews"} permanently deleted.`,
      });
    }

    const targetStatus = status || (action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending");
    const count = await dbBulkUpdateReviewStatus(ids, targetStatus);

    invalidateServerCache("reviews");
    try {
      revalidatePath("/reviews");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      action: "status",
      status: targetStatus,
      count,
      message: `${count} ${count === 1 ? "review" : "reviews"} marked as "${targetStatus}".`,
    });
  } catch (err: any) {
    console.error("API POST /api/reviews/bulk error:", err);
    return NextResponse.json({ error: err.message || "Failed to perform bulk operation" }, { status: 500 });
  }
}
