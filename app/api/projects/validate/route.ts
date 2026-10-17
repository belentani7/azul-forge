import { NextResponse } from "next/server";
import { createProject } from "@/lib/generator/project";
import { parseProjectRequest } from "@/lib/server/requests";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const parsed = await parseProjectRequest(request);
  if (!parsed.ok) return parsed.response;
  const { manifest, quality } = createProject(parsed.data);
  return NextResponse.json({ slug: manifest.slug, quality },
    { headers: { "Cache-Control": "no-store" } });
}
