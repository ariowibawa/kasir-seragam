export const dynamic = "force-dynamic";

import { getUniformItems } from "@/services/uniform.service";
import KasirPageClient from "@/components/kasir/KasirPageClient";

export default async function CashierPage() {
  const uniformItems = await getUniformItems();
  return <KasirPageClient uniformItems={uniformItems} />;
}
