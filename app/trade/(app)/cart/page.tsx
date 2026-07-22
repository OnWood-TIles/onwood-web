import { PageHeading } from "../tradeUi";
import CartView from "./CartView";

export const dynamic = "force-dynamic";

// Order-request review. The cart lives in localStorage (client), so the review +
// submit UI is a client component. On submit OnBase re-prices everything, so the
// totals here are clearly indicative only.
export default function CartPage() {
  return (
    <div>
      <PageHeading
        title="Your order request"
        sub="Review your items and send them through. Prices are indicative, we will confirm the final pricing and stock before we process it."
      />
      <CartView />
    </div>
  );
}
