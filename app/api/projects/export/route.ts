import { buildZip } from "@/lib/generator/zip";
import { createProject } from "@/lib/generator/project";
import { parseProjectRequest } from "@/lib/server/requests";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const parsed = await parseProjectRequest(request);
  if (!parsed.ok) return parsed.response;
  const { manifest, files } = createProject(parsed.data);
  const bytes = await buildZip(files, manifest.slug);
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${manifest.slug}.zip"`,
    "Content-Length": String(bytes.length),
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff"
  } });
}
