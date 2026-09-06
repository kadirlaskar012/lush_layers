import { NextRequest, NextResponse } from "next/server";
import { dbGetCategories, dbCreateCategory } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const categories = await dbGetCategories(all);
    return NextResponse.json(categories);
  } catch (err: any) {
    console.error("API GET /api/categories error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await dbCreateCategory(body);
    return NextResponse.json({ message: "Category created", category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
