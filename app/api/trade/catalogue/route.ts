import { NextResponse } from "next/server";
import { tradeCatalogue, TradeError } from "../../../../lib/onbase/trade";

export const runtime = "nodejs";

// The signed-in customer's catalogue (trade pricing + live stock). Convenience
// endpoint for client fetching; the catalogue page reads it server-side directly.
export async function GET() {
  try {
    const { items, rrpLevel } = await tradeCatalogue();
    return NextResponse.json({ data: items, meta: { total: items.length, rrpLevel } });
  } catch (err) {
    const status = err instanceof TradeError ? err.status : 500;
    const message = err instanceof TradeError ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status });
  }
}
