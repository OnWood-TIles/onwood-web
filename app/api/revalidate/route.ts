import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// Server-to-server hook: OnBase calls this whenever website-visible data changes
// (stock, price, publish, archive) so the storefront drops its cached product
// feed and reflects OnBase immediately, instead of waiting for the 30s poll.
// Secret-gated; the proxy allowlists this path so OnBase can reach it while the
// site is otherwise gated.
export async function POST(req: NextRequest) {
  const secret = process.env.WEBSITE_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ error: "Revalidation not configured" }, { status: 503 });
  if (req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  for (const tag of ["ranges", "taxonomy", "nav"]) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true });
}
