import { NextResponse } from "next/server";
import {
  tradeListOrders,
  tradeCreateOrder,
  TradeError,
  type BuildOptions,
  type CreateOrderPayload,
} from "../../../../lib/onbase/trade";

// A build's option picks: string or string[] values only, a sane size.
function cleanOptions(v: unknown): BuildOptions | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: BuildOptions = {};
  for (const [k, x] of Object.entries(v as Record<string, unknown>).slice(0, 60)) {
    if (typeof x === "string") out[k.slice(0, 60)] = x.slice(0, 200);
    else if (Array.isArray(x)) out[k.slice(0, 60)] = x.filter((y): y is string => typeof y === "string").slice(0, 30).map((y) => y.slice(0, 200));
  }
  return Object.keys(out).length ? out : undefined;
}

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
            (it): it is { productId: string; quantity: number; colour?: string; options?: BuildOptions } =>
              !!it && typeof it.productId === "string" && typeof it.quantity === "number",
          )
          .map((it) => {
            const options = cleanOptions(it.options);
            return {
              productId: it.productId,
              quantity: it.quantity,
              ...(typeof it.colour === "string" && it.colour ? { colour: it.colour } : {}),
              ...(options ? { options } : {}),
            };
          })
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
