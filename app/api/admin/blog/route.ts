import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getBlog, saveBlog, type BlogPost } from "../../../../lib/onbase/client";

export const dynamic = "force-dynamic";

// Staff-only blog editor API. The proxy already gates /api/admin behind the
// preview cookie; re-checked here because a write endpoint must never rely on
// routing alone.
async function isStaff(): Promise<boolean> {
  const token = process.env.PREVIEW_TOKEN;
  if (!token) return false;
  const jar = await cookies();
  return jar.get("owp_preview")?.value === token;
}

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const posts = await getBlog();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  if (!(await isStaff())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { posts?: BlogPost[] } | null;
  if (!body || !Array.isArray(body.posts)) {
    return NextResponse.json({ error: "Body must be { posts: [...] }" }, { status: 400 });
  }
  try {
    const saved = await saveBlog(body.posts);
    revalidateTag("blog", "max"); // /blog + /blog/[slug] pick up the change
    return NextResponse.json({ posts: saved });
  } catch (e) {
    console.error("[admin/blog] save failed:", e);
    return NextResponse.json({ error: "Could not save the blog - try again" }, { status: 502 });
  }
}
