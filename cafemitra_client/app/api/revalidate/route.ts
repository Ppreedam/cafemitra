import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// Called by the Django backend right after a blog article is published,
// edited or deleted, so the change is live immediately instead of waiting for
// the periodic ISR refresh. Protected by a shared secret.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const body = await request.json().catch(() => ({}));
  if (!secret || body?.secret !== secret) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  const slug = typeof body.slug === "string" ? body.slug.replace(/[^a-z0-9-]/gi, "") : "";
  if (slug) revalidatePath(`/blog/${slug}`);
  return NextResponse.json({ revalidated: true });
}
