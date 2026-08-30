import { NextResponse } from "next/server";
import { getPresence } from "../../../../lib/onbase/client";

// Live visitor count for the staff analytics dashboard. Gated by the proxy
// (/api/admin/* requires the staff cookie), so this is only ever reached by a
// signed-in staff member. Reads the live snapshot from OnBase server-side; the
// LiveVisitors widget on /admin/analytics polls it every ~10s.
export const dynamic = "force-dynamic";

export async function GET() {
  const presence = await getPresence();
  return NextResponse.json(presence);
}
