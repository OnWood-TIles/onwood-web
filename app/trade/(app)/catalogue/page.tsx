import { getShopMenu } from "../../../../lib/onbase/client";
import { DepartmentTablet, DEPT_TABLET_CSS, EmptyCatalogue } from "../../../components/shop/shared";
import { PageHeading } from "../tradeUi";

export const dynamic = "force-dynamic";

// The trade catalogue is the public shop, department-first: pick a space, then
// drill into its filtered grid where every product carries the customer's trade
// pricing + add-to-order. Only populated departments show (no dead ends).
export default async function TradeCataloguePage() {
  const depts = await getShopMenu().catch(() => []);

  return (
    <div>
      <PageHeading
        title="Catalogue"
        sub="Browse the full range at your trade pricing. Pick a department, filter to what you need, then add it straight to your order request."
      />

      {depts.length === 0 ? (
        <EmptyCatalogue note="We are stocking your online catalogue right now. Check back shortly, or get in touch and we will sort it out." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 22 }}>
          {depts.map((d, i) => (
            <DepartmentTablet key={d.slug} dept={d} priority={i < 3} basePath="/trade/catalogue" />
          ))}
        </div>
      )}

      <style>{DEPT_TABLET_CSS}</style>
    </div>
  );
}
