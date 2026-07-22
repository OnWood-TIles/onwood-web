import { NextResponse } from "next/server";
import {
  tradeListOrders,
  tradeCreateOrder,
  TradeError,
  type CreateOrderPayload,
} from "../../../../lib/onbase/trade";

export const runtime = "nodejs";

function fail(err: unknown) {
  const status = err instanceof TradeError ? err.status : 500;
  const message = err instanceof TradeError ? err.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status });
}

// List the signed-in customer's orders.
export async function GET() {
  try {
    const data = await tradeListOrders();
    return NextResponse.json({ data, meta: { total: data.length } });
  } catch (err) {
    return fail(err);
  }
}

// Submit a new order request. OnBase re-prices server-side; we trust its result.
export async function POST(request: Request) {
  let body: CreateOrderPayload;
  try {
    const b = (await request.json()) as Partial<CreateOrderPayload>;
    const items = Array.isArray(b.items)
      ? b.items
          .filter(
            (it): it is { productId: string; quantity: number; colour?: string } =>
              !!it && typeof it.productId === "string" && typeof it.quantity === "number",
          )
          .map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            ...(typeof it.colour === "string" && it.colour ? { colour: it.colour } : {}),
          }))
      : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Your order is empty." }, { status: 400 });
    }
    body = {
      items,
      ...(typeof b.note === "string" && b.note.trim() ? { note: b.note.trim() } : {}),
      ...(typeof b.poReference === "string" && b.poReference.trim()
        ? { poReference: b.poReference.trim() }
        : {}),
      ...(typeof b.deliveryAddress === "string" && b.deliveryAddress.trim()
        ? { deliveryAddress: b.deliveryAddress.trim() }
        : {}),
    };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await tradeCreateOrder(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return fail(err);
  }
}
