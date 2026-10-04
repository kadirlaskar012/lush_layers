import { NextRequest, NextResponse } from "next/server";
import { dbGetAdminCakes, dbGetPublishedCakes, dbCreateCake } from "@/lib/db";

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
        if (cakes) return NextResponse.json(cakes);
      } catch (e: any) {
        console.error("API GET /api/cakes error fetching published cakes from db:", e.message || e);
      }

      const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:8000" : null);
      if (backendBase) {
        try {
          let url = `${backendBase}/api/cakes?status=published`;
          if (placement) url += `&placement=${encodeURIComponent(placement)}`;
          if (categoryId) url += `&category_id=${encodeURIComponent(categoryId)}`;
          if (flavour) url += `&flavour=${encodeURIComponent(flavour)}`;
          if (search) url += `&search=${encodeURIComponent(search)}`;
          const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2000) });
          if (res.ok) return NextResponse.json(await res.json());
        } catch {}
      }
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

      // If querying pending cakes, check local Python backend to guarantee newly ingested cakes appear instantly
      const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8000" : null);
      if (backendBase && (status === "pending" || !status)) {
        try {
          let localUrl = `${backendBase}/api/cakes`;
          if (status) localUrl += `?status=${encodeURIComponent(status)}`;
          const localRes = await fetch(localUrl, { cache: "no-store", signal: AbortSignal.timeout(1500) });
          if (localRes.ok) {
            const localCakes = await localRes.json();
            
            // Query all cloud cakes to ensure we don't resurrect published/approved cakes as pending
            const allCloudCakes = await dbGetAdminCakes({});
            const cloudCakeMap = new Map((allCloudCakes || []).map((c: any) => [String(c.id), c]));
            
            const merged = [...(cakes || [])];
            const currentMergedIds = new Set(merged.map((c: any) => String(c.id)));

            for (const lc of localCakes) {
              const cloudCake = cloudCakeMap.get(String(lc.id));
              if (cloudCake) {
                // If cake exists in cloud and its status is not pending, DO NOT show it as pending
                if (status === "pending" && cloudCake.status !== "pending") {
                  // Synchronize local SQLite in background
                  fetch(`${backendBase}/api/cakes/${lc.id}/${cloudCake.status}`, { method: "POST" }).catch(() => {});
                  continue;
                }
              }
              // If not in cloud yet (fresh upload), or matches current query and not already present
              if (!currentMergedIds.has(String(lc.id))) {
                merged.push(lc);
                currentMergedIds.add(String(lc.id));
              }
            }
            return NextResponse.json(merged);
          }
        } catch {}
      }

      return NextResponse.json(cakes);
    } catch (e: any) {
      console.error("API GET /api/cakes admin db error:", e.message || e);
      const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8000" : null);
      if (backendBase) {
        try {
          let url = `${backendBase}/api/cakes`;
          const q: string[] = [];
          if (status) q.push(`status=${encodeURIComponent(status)}`);
          if (categoryId) q.push(`category_id=${encodeURIComponent(categoryId)}`);
          if (search) q.push(`search=${encodeURIComponent(search)}`);
          if (q.length > 0) url += `?${q.join("&")}`;
          const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2000) });
          if (res.ok) return NextResponse.json(await res.json());
        } catch {}
      }
      return NextResponse.json([]);
    }
  } catch (err: any) {
    console.error("API GET /api/cakes error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch cakes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8000" : null);
    const contentType = req.headers.get("content-type") || "";

    if (backendBase) {
      try {
        let backendRes: Response;
        if (contentType.includes("multipart/form-data")) {
          const formData = await req.formData();
          backendRes = await fetch(`${backendBase}/api/cakes`, {
            method: "POST",
            body: formData,
          });
        } else {
          const jsonBody = await req.json();
          backendRes = await fetch(`${backendBase}/api/cakes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonBody),
          });
        }

        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data, { status: 201 });
        } else {
          const errData = await backendRes.json().catch(() => ({}));
          return NextResponse.json(
            { error: errData.detail || errData.message || "Backend cake creation failed" },
            { status: backendRes.status }
          );
        }
      } catch (backendErr: any) {
        console.warn("Backend forward failed, falling back to direct db:", backendErr.message || backendErr);
      }
    }

    // Standalone DB Fallback
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const name = String(formData.get("name") || "").trim();
      const flavour = String(formData.get("flavour") || "Vanilla Bean").trim();
      const category_id = formData.get("category_id") ? String(formData.get("category_id")) : undefined;
      const description = String(formData.get("description") || "").trim();
      const image_url = formData.get("image_url") ? String(formData.get("image_url")) : "";
      const status = String(formData.get("status") || "approved");
      const is_hero = String(formData.get("is_hero") || "").toLowerCase() === "true";
      const is_trending = String(formData.get("is_trending") || "").toLowerCase() === "true";
      const is_inspiration = String(formData.get("is_inspiration") || "").toLowerCase() === "true";
      const is_seasonal = String(formData.get("is_seasonal") || "").toLowerCase() === "true";

      let available_sizes = ["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"];
      const rawSizes = formData.get("available_sizes");
      if (rawSizes) {
        try {
          available_sizes = JSON.parse(String(rawSizes));
        } catch {
          available_sizes = String(rawSizes).split(",").map((s) => s.trim()).filter(Boolean);
        }
      }

      if (!name) return NextResponse.json({ error: "Cake name is required" }, { status: 400 });
      if (!image_url) return NextResponse.json({ error: "Image is required" }, { status: 400 });

      const newCake = await dbCreateCake({
        name,
        flavour,
        category_id,
        description,
        image_url,
        status: status as any,
        available_sizes,
        is_hero,
        is_trending,
        is_inspiration,
        is_seasonal,
      });
      return NextResponse.json(newCake, { status: 201 });
    } else {
      const body = await req.json();
      if (!body.name) return NextResponse.json({ error: "Cake name is required" }, { status: 400 });
      if (!body.image_url) return NextResponse.json({ error: "Image is required" }, { status: 400 });
      const newCake = await dbCreateCake(body);
      return NextResponse.json(newCake, { status: 201 });
    }
  } catch (err: any) {
    console.error("API POST /api/cakes error:", err);
    return NextResponse.json({ error: err.message || "Failed to create cake" }, { status: 500 });
  }
}

