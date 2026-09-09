import { NextRequest, NextResponse } from "next/server";
import { dbBulkUpdateEnquiryStatus, dbBulkDeleteEnquiries } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No enquiry IDs provided" }, { status: 400 });
    }

    if (action === "delete") {
      const deletedCount = await dbBulkDeleteEnquiries(ids);
      return NextResponse.json({
        success: true,
        action: "delete",
        count: deletedCount,
        message: `${deletedCount} ${deletedCount === 1 ? "order" : "orders"} permanently deleted.`,
      });
    }

    if (!status) {
      return NextResponse.json({ error: "Target status not specified" }, { status: 400 });
    }

    const updated = await dbBulkUpdateEnquiryStatus(ids, status);
    return NextResponse.json({
      success: true,
      action: "status",
      status,
      count: updated.length,
      message: `${updated.length} ${updated.length === 1 ? "order" : "orders"} updated to "${status}".`,
    });
  } catch (err: any) {
    console.error("API POST /api/enquiries/bulk error:", err);
    return NextResponse.json({ error: err.message || "Failed to perform bulk operation" }, { status: 500 });
  }
}
