import { NextRequest, NextResponse } from "next/server";
import { dbGetAdminCakes, dbGetPublishedCakes } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("category_id") || undefined;
    const flavour = searchParams.get("flavour") || undefined;
    const search = searchParams.get("search") || undefined;
    const placement = searchParams.get("placement") || undefined;
    const sortBy = searchParams.get("sort_by") || undefined;

    if (status === "published") {
      const cakes = await dbGetPublishedCakes({ categoryId, flavour, search, placement });
      return NextResponse.json(cakes);
    }

    const cakes = await dbGetAdminCakes({
      status: status || undefined,
      categoryId,
      search,
      sortBy,
      placement,
    });
    return NextResponse.json(cakes);
  } catch (err: any) {
    console.error("API GET /api/cakes error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch cakes" }, { status: 500 });
  }
}
