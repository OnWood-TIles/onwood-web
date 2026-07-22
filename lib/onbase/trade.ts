// Server-only client for OnBase's Trade Partner portal API. This proxies AUTHENTICATED
// trade-customer actions (login, catalogue, orders) server-to-server behind the
// tenant-wide Bearer API key.
//
// Design rules (differ from the fail-open client.ts reads):
//   - Server-only: the Bearer key never reaches the browser.
//   - The trade SESSION token lives ONLY in the httpOnly `ow_trade` cookie. It is
//     read here via next/headers cookies() and forwarded as `X-Trade-Session`.
//     It is NEVER returned to client JS (the login route sets the cookie; the
//     token from login is handed to that route only).
//   - These FAIL CLOSED (throw on error) because they gate real customer actions,
//     unlike the catalogue reads in client.ts which fail-open into a page render.
import "server-only";
import { cookies } from "next/headers";
import type { Availability } from "./client";

const BASE = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const KEY = process.env.ONBASE_API_KEY;

export const TRADE_COOKIE = "ow_trade";

// ── Shapes (mirror the OnBase /api/v1/trade contract) ───────────────────────
export type TradeCustomer = { id: string; name: string; email: string };

export type TradeMe = {
  id: string;
  name: string;
  preferredName: string | null;
  loginEmail: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  abn: string | null;
  creditLimit: number | null;
  paymentTermsDays: number | null;
  lastTradeLoginAt: string | null;
};

export type PriceDisplayGst = "NO_GST" | "INCLUDE_GST" | "EXCLUDE_GST";

export type CatalogueColour = {
  colour: string;
  swatchHex: string | null;
  image: string | null;
  availability: Availability;
  qty: number;
};

export type CatalogueItem = {
  productId: string;
  name: string;
  unit: string | null;
  coverageM2: number | null;
  description: string | null;
  image: string | null;
  images: string[];
  department: string | null;
  departmentLabel: string;
  categories: string[];
  rrpPrice: number; // struck-through RRP
  tradePrice: number | null; // "Your Price"; null = not priced (browse-only)
  priceLevel: string | null;
  priceDisplayGst: PriceDisplayGst;
  availability: Availability;
  qty: number;
  colours: CatalogueColour[];
};

// Derived from the linked OnBase job sheet's live state (received -> in progress
// -> invoiced -> complete), plus cancelled. No manual status steps.
export type OrderStatus =
  | "RECEIVED"
  | "IN_PROGRESS"
  | "INVOICED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderSummary = {
  id: string;
  orderCode: string;
  status: OrderStatus;
  subtotal: number;
  gstMode: string;
  poReference: string | null;
  itemCount: number;
  createdAt: string;
  confirmedAt: string | null;
};

export type OrderItem = {
  id: string;
  name: string;
  description1: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variationColour: string | null;
};

export type OrderDetail = {
  id: string;
  orderCode: string;
  status: OrderStatus;
  subtotal: number;
  gstMode: string;
  customerNote: string | null;
  poReference: string | null;
  deliveryAddress: string | null;
  createdAt: string;
  confirmedAt: string | null;
  items: OrderItem[];
};

export type CreateOrderPayload = {
  items: { productId: string; quantity: number; colour?: string }[];
  note?: string;
  poReference?: string;
  deliveryAddress?: string;
};

// Errors carry the upstream status so routes can echo it back to the client.
export class TradeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "TradeError";
    this.status = status;
  }
}

function requireKey(): string {
  if (!KEY) throw new TradeError("ONBASE_API_KEY not configured", 500);
  return KEY;
}

// The raw session token from the httpOnly cookie (never exposed to the client).
async function sessionToken(): Promise<string> {
  const store = await cookies();
  const token = store.get(TRADE_COOKIE)?.value;
  if (!token) throw new TradeError("Not signed in", 401);
  return token;
}

// OnBase local-dev uploads come back as relative "/uploads/..." paths - absolutize
// against the API origin so <img> works from the website.
const abs = (u?: string | null): string | null =>
  u && u.startsWith("/") ? `${BASE}${u}` : (u ?? null);

// ── Core fetch helpers (fail CLOSED) ────────────────────────────────────────

// Reads the JSON error message from an upstream failure, defensively.
async function errorMessage(res: Response): Promise<string> {
  try {
    const json = (await res.json()) as { error?: unknown };
    if (typeof json?.error === "string" && json.error) return json.error;
  } catch {
    // no JSON body
  }
  return `Request failed (${res.status})`;
}

// Unauthenticated call: Bearer only (login, forgot-password, set-password).
async function tradePublic<T>(
  path: string,
  init: { method: "POST"; body: unknown },
): Promise<T> {
  const key = requireKey();
  let res: Response;
  try {
    res = await fetch(`${BASE}/api/v1/trade${path}`, {
      method: init.method,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[trade] POST ${path} failed:`, err);
    throw new TradeError("Could not reach the ordering system, please try again.", 502);
  }
  if (!res.ok) throw new TradeError(await errorMessage(res), res.status);
  return (await res.json()) as T;
}

// Authenticated call: Bearer + X-Trade-Session (the session token from the cookie).
async function tradeAuthed<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const key = requireKey();
  const token = await sessionToken();
  const method = init?.method ?? "GET";
  let res: Response;
  try {
    res = await fetch(`${BASE}/api/v1/trade${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        "X-Trade-Session": token,
        ...(init?.body != null ? { "Content-Type": "application/json" } : {}),
      },
      body: init?.body != null ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[trade] ${method} ${path} failed:`, err);
    throw new TradeError("Could not reach the ordering system, please try again.", 502);
  }
  if (!res.ok) throw new TradeError(await errorMessage(res), res.status);
  return (await res.json()) as T;
}

// ── Exported helpers ────────────────────────────────────────────────────────

/** Exchange email + password for a session token. The caller (login route) sets
 *  the httpOnly cookie; the token is NEVER passed to client JS. Throws on 401/429. */
export async function tradeLogin(
  email: string,
  password: string,
): Promise<{ token: string; customer: TradeCustomer }> {
  const json = await tradePublic<{ token: string; customer: TradeCustomer }>("/login", {
    method: "POST",
    body: { email, password },
  });
  if (!json?.token) throw new TradeError("Login failed", 401);
  return json;
}

/** End the OnBase-side session (best-effort). The cookie is cleared by the route. */
export async function tradeLogout(): Promise<void> {
  try {
    await tradeAuthed<{ ok: boolean }>("/logout", { method: "POST" });
  } catch (err) {
    // Logout should not hard-fail the user out of clearing their cookie.
    console.error("[trade] logout failed:", err);
  }
}

/** The signed-in trade customer's profile. Throws 401 when not signed in - the
 *  trade layout uses this as the real auth check (proxy only checks presence). */
export async function tradeMe(): Promise<TradeMe> {
  const json = await tradeAuthed<{ data: TradeMe }>("/me");
  return json.data;
}

/** The customer's catalogue: the full online range, each with the RRP + their
 *  trade price (null when not yet priced for them), plus the RRP tier level. */
export async function tradeCatalogue(): Promise<{ rrpLevel: string; items: CatalogueItem[] }> {
  const json = await tradeAuthed<{ data: CatalogueItem[]; meta?: { rrpLevel?: string } }>("/catalogue");
  const items = Array.isArray(json?.data) ? json.data : [];
  // Absolutize any relative image paths so <img> works from the website origin.
  const mapped = items.map((it) => ({
    ...it,
    image: abs(it.image),
    images: (it.images ?? []).map((i) => abs(i) as string).filter(Boolean),
    colours: (it.colours ?? []).map((c) => ({ ...c, image: abs(c.image) })),
  }));
  return { rrpLevel: json?.meta?.rrpLevel ?? "SELL", items: mapped };
}

/** The customer's order history (summaries). */
export async function tradeListOrders(): Promise<OrderSummary[]> {
  const json = await tradeAuthed<{ data: OrderSummary[] }>("/orders");
  return Array.isArray(json?.data) ? json.data : [];
}

/** One order with its line items. Throws 404 when it isn't the customer's. */
export async function tradeGetOrder(id: string): Promise<OrderDetail> {
  const json = await tradeAuthed<{ data: OrderDetail }>(`/orders/${encodeURIComponent(id)}`);
  return json.data;
}

/** Submit a new order request. OnBase re-prices server-side; trust its response. */
export async function tradeCreateOrder(
  payload: CreateOrderPayload,
): Promise<{ id: string; orderCode: string; status: OrderStatus; subtotal: number }> {
  const json = await tradeAuthed<{
    data: { id: string; orderCode: string; status: OrderStatus; subtotal: number };
  }>("/orders", { method: "POST", body: payload });
  return json.data;
}

/** Kick off a password reset email. Always resolves (OnBase returns {ok:true}). */
export async function tradeForgot(email: string, portalUrl: string): Promise<void> {
  await tradePublic<{ ok: boolean }>("/forgot-password", {
    method: "POST",
    body: { email, portalUrl },
  });
}

/** Set a new password from a reset token. Throws on an invalid/expired token. */
export async function tradeSetPassword(resetToken: string, password: string): Promise<void> {
  await tradePublic<{ ok: boolean }>("/set-password", {
    method: "POST",
    body: { resetToken, password },
  });
}
