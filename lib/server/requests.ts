import { NextResponse } from "next/server";
import { projectSchema as projectInputSchema, type ProjectInput } from "@/lib/generator/schema";

const MAX_BYTES = 16 * 1024;
class BodyTooLarge extends Error {}

type Parsed = { ok: true; data: ProjectInput } | { ok: false; response: NextResponse };

function error(status: number, message: string, issues?: { path: string; message: string }[]): Parsed {
  return { ok: false, response: NextResponse.json({ error: message, ...(issues ? { issues } : {}) },
    { status, headers: { "Cache-Control": "no-store" } }) };
}

export async function parseProjectRequest(request: Request): Promise<Parsed> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return error(415, "Envía application/json.");
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) return error(413, "El formulario supera 16 KB.");
  let raw: string;
  try {
    if (!request.body) return error(400, "Falta el cuerpo de la petición.");
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { void reader.cancel().catch(() => {}); throw new BodyTooLarge(); }
      chunks.push(value);
    }
    raw = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
  } catch (cause) {
    return cause instanceof BodyTooLarge ? error(413, "El formulario supera 16 KB.") : error(400, "No se pudo leer el cuerpo de la petición.");
  }
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return error(400, "El JSON no es válido."); }
  const result = projectInputSchema.safeParse(json);
  if (!result.success) {
    return error(400, "Revisa los campos del proyecto.", result.error.issues.map((issue) => ({
      path: issue.path.join("."), message: issue.message
    })));
  }
  return { ok: true, data: result.data };
}
