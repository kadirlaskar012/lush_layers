import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbGetCakeBySlug, dbUpdateCakeDetails, dbDeleteCake } from "@/lib/db";
import { invalidateServerCache } from "@/lib/serverData";
import { syncCakeActionToLocal } from "@/lib/syncLocal";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cake = await dbGetCakeBySlug(id);
    if (!cake) {
      return NextResponse.json({ error: "Cake not found" }, { status: 404 });
    }
    return NextResponse.json(cake);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await dbUpdateCakeDetails(id, body);
    
    // Sync updates to local Python backend
    await syncCakeActionToLocal(id, "update", body);

    invalidateServerCache("cakes");
    revalidatePath("/");
    revalidatePath("/cakes");
    if (updated?.slug) {
      revalidatePath(`/cakes/${updated.slug}`);
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await dbDeleteCake(id);
    
    // Sync deletion to local Python backend
    await syncCakeActionToLocal(id, "delete");

    invalidateServerCache("cakes");
    revalidatePath("/");
    revalidatePath("/cakes");
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
