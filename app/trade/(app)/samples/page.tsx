import { PageHeading } from "../tradeUi";
import SamplesView from "./SamplesView";

export const dynamic = "force-dynamic";

// Free sample request. The picks live in localStorage (client), so the review + send UI is a
// client component. Sending emails the list to our team; it is not an order.
export default function SamplesPage() {
  return (
    <div>
      <PageHeading
        title="Your sample request"
        sub="Free single-tile samples for your showroom or your clients. Each one comes labelled with the tile name and details."
      />
      <SamplesView />
    </div>
  );
}
