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
      try {
        const cakes = await dbGetPublishedCakes({ categoryId, flavour, search, placement });
        if (cakes && cakes.length > 0) return NextResponse.json(cakes);
      } catch (e) {
        console.warn("API GET /api/cakes falling back to local backend:", e);
      }
      try {
        let url = "http://localhost:8000/api/cakes?status=published";
        if (placement) url += `&placement=${encodeURIComponent(placement)}`;
        if (categoryId) url += `&category_id=${encodeURIComponent(categoryId)}`;
        if (flavour) url += `&flavour=${encodeURIComponent(flavour)}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return NextResponse.json(await res.json());
      } catch {}
      return NextResponse.json([]);
    }

    try {
      const cakes = await dbGetAdminCakes({
        status: status || undefined,
        categoryId,
        search,
        sortBy,
        placement,
      });
      return NextResponse.json(cakes);
    } catch (e) {
      console.warn("API GET /api/cakes admin falling back to local backend:", e);
      try {
        let url = "http://localhost:8000/api/cakes";
        const q: string[] = [];
        if (status) q.push(`status=${encodeURIComponent(status)}`);
        if (categoryId) q.push(`category_id=${encodeURIComponent(categoryId)}`);
        if (search) q.push(`search=${encodeURIComponent(search)}`);
        if (q.length > 0) url += `?${q.join("&")}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return NextResponse.json(await res.json());
      } catch {}
      return NextResponse.json([]);
    }
  } catch (err: any) {
    console.error("API GET /api/cakes error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch cakes" }, { status: 500 });
  }
}
