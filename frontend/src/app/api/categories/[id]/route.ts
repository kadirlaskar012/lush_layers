import { NextRequest, NextResponse } from "next/server";
import { dbUpdateCategory } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const category = await dbUpdateCategory(id, body);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/categories");
      revalidatePath("/cakes");
    } catch {}

    // Immediately notify local Python tools backend if active
    try {
      fetch("http://127.0.0.1:8000/api/categories/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
        signal: AbortSignal.timeout(800),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ message: "Category updated", category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
