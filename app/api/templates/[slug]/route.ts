import { NextResponse } from "next/server";
import { getTemplate } from "@/lib/generator/templates";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const template = getTemplate(slug);
  if (!template) return NextResponse.json({ error: "Plantilla no encontrada." }, { status: 404 });
  return NextResponse.json({ template }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
