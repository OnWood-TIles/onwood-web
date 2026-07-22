import { NextResponse } from "next/server";
import { tradeGetOrder, TradeError } from "../../../../../lib/onbase/trade";

export const runtime = "nodejs";

// One order (with line items) belonging to the signed-in customer.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const data = await tradeGetOrder(id);
    return NextResponse.json({ data });
  } catch (err) {
    const status = err instanceof TradeError ? err.status : 500;
    const message = err instanceof TradeError ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status });
  }
}
