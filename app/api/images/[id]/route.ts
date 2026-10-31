import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });

  const [img] = await db.select().from(images).where(eq(images.id, id)).limit(1);
  if (!img) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.contentType,
      // A new upload always gets a new id, so the bytes behind an id never change
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // Slides download under their original name instead of opening in the browser
      ...(img.filename && { "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(img.filename)}` }),
    },
  });
}
