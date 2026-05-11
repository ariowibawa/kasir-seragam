export const dynamic = "force-dynamic";

import { getStudents } from "@/services/student.service";
import StudentPageClient from "@/components/siswa/StudentPageClient";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentDataPage({ searchParams }: Props) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();
  if (params.page) urlSearchParams.set("page", String(params.page));
  if (params.per_page) urlSearchParams.set("per_page", String(params.per_page));
  if (params.search) urlSearchParams.set("search", String(params.search));
  if (params.grade) urlSearchParams.set("grade", String(params.grade));
  if (params.uniform_status) urlSearchParams.set("uniform_status", String(params.uniform_status));

  const result = await getStudents(urlSearchParams);

  return <StudentPageClient initialData={result} />;
}
