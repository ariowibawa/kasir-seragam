export const dynamic = "force-dynamic";

import { getEntries, getCashBookSummary } from "@/services/cashbook.service";
import KasPageClient from "@/components/kas/KasPageClient";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CashBookPage({ searchParams }: Props) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();
  if (params.page) urlSearchParams.set("page", String(params.page));
  if (params.per_page) urlSearchParams.set("per_page", String(params.per_page));
  if (params.category) urlSearchParams.set("category", String(params.category));
  if (params.start_date) urlSearchParams.set("start_date", String(params.start_date));
  if (params.end_date) urlSearchParams.set("end_date", String(params.end_date));

  const [entries, summary] = await Promise.all([
    getEntries(urlSearchParams),
    getCashBookSummary(),
  ]);

  return <KasPageClient initialEntries={entries} summary={summary} />;
}
