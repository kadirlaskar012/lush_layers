import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Processing jobs are local to the machine running the python CLI
  return NextResponse.json([]);
}
