// Cleaning for public form fields before they go into emails, OnBase or OnConnect.

/** One-line field (name, email, phone): strings only, control characters and line breaks
 *  collapsed to a space (so nothing can spill into an email header), trimmed and capped. */
export const line = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max) : "";

/** Multi-line field (message, notes): keeps line breaks, drops other control characters, capped. */
export const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max) : "";

/** A finite number clamped to [min, max], else `fallback`. */
export const num = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** An email address for server logs: enough to recognise ("j***@gmail.com"), not the whole thing. */
export const maskEmail = (email: string): string => {
  const [user, domain] = email.split("@");
  return domain ? `${(user || "").slice(0, 1)}***@${domain}` : "***";
};
