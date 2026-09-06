import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, tag, secret } = body;

    const expectedSecret = process.env.REVALIDATE_SECRET || "lush_layers_revalidate_secret_key_2026";
    if (secret !== expectedSecret) {
      return NextResponse.json({ message: "Invalid revalidation secret" }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath("/");
      revalidatePath("/cakes");
      revalidatePath("/reviews");
    }

    if (tag) {
      revalidateTag(tag, "max");
    }

    return NextResponse.json({
      revalidated: true,
      path: path || "all",
      tag: tag || null,
      now: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Error during revalidation", error: err.message }, { status: 500 });
  }
}
