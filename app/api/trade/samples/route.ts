import { NextResponse } from "next/server";
import { tradeSendSamples, TradeError, type SampleRequestPayload } from "../../../../lib/onbase/trade";

export const runtime = "nodejs";

// Send the signed-in trade partner's sample request. OnBase checks every sample, emails
// the team (list + PDF) and sends the partner a confirmation.
export async function POST(request: Request) {
  let body: SampleRequestPayload;
  try {
    const b = (await request.json()) as Partial<SampleRequestPayload>;
    const items = Array.isArray(b.items)
      ? b.items
          .filter((it): it is { productId: string; colour?: string } => !!it && typeof it.productId === "string")
          .slice(0, 40)
          .map((it) => ({ productId: it.productId.slice(0, 60), ...(typeof it.colour === "string" && it.colour ? { colour: it.colour.slice(0, 120) } : {}) }))
      : [];
    if (items.length === 0) return NextResponse.json({ error: "Your sample request is empty." }, { status: 400 });
    body = {
      items,
      stand: b.stand === true,
      ...(typeof b.note === "string" && b.note.trim() ? { note: b.note.trim().slice(0, 1500) } : {}),
    };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await tradeSendSamples(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const status = err instanceof TradeError ? err.status : 500;
    const message = err instanceof TradeError ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status });
  }
}
