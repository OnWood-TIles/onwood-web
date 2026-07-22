import { tradeCatalogue } from "../../../../lib/onbase/trade";
import { PageHeading } from "../tradeUi";
import CatalogueGrid from "./CatalogueGrid";

export const dynamic = "force-dynamic";

// The customer's personalised catalogue. Fetched server-side (trade pricing +
// live stock never touch the browser un-authenticated); the client grid handles
// colour selection, quantity and add-to-cart against the localStorage cart.
export default async function CataloguePage() {
  const { items } = await tradeCatalogue().catch(() => ({ rrpLevel: "SELL", items: [] }));

  return (
    <div>
      <PageHeading
        title="Catalogue"
        sub="Your trade pricing across our full range. RRP is shown struck through, with your price beneath. Add what you need, then submit your order request."
      />
      <CatalogueGrid items={items} />
    </div>
  );
}
