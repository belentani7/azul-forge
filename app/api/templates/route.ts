import { NextResponse } from "next/server";
import { templates } from "@/lib/generator/templates";

export function GET() {
  return NextResponse.json({ templates },
    { headers: { "Cache-Control": "public, max-age=3600" } });
}
