import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getNav, getTaxonomy, saveNav, type NavItem } from "../../../../lib/onbase/client";

export const dynamic = "force-dynamic";

// Staff-only nav designer API. The proxy already gates /api/admin behind the
// preview cookie; this re-checks in-handler (defence in depth) because a
// write endpoint must never rely on routing alone.
async function isStaff(): Promise<boolean> {
  const token = process.env.PREVIEW_TOKEN;
  if (!token) return false;
  const jar = await cookies();
  return jar.get("owp_preview")?.value === token;
}

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const [items, taxonomy] = await Promise.all([getNav(), getTaxonomy()]);
  return NextResponse.json({ items, taxonomy });
}

export async function POST(req: NextRequest) {
  if (!(await isStaff())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { items?: NavItem[] } | null;
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Body must be { items: [...] }" }, { status: 400 });
  }
  try {
    const saved = await saveNav(body.items);
    revalidateTag("nav", "max"); // header picks the new design up on the next request
    return NextResponse.json({ items: saved });
  } catch (e) {
    console.error("[admin/nav] save failed:", e);
    return NextResponse.json({ error: "Could not save the navigation - try again" }, { status: 502 });
  }
}
