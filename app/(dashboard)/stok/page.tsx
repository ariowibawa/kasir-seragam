export const dynamic = "force-dynamic";

import { getUniformItems } from "@/services/uniform.service";
import { getStockAlerts } from "@/services/stock.service";
import StokPageClient from "@/components/stok/StokPageClient";

export default async function StokSeragamPage() {
  const [uniformItems, stockAlerts] = await Promise.all([
    getUniformItems(),
    getStockAlerts(),
  ]);

  return <StokPageClient uniformItems={uniformItems} stockAlerts={stockAlerts} />;
}
