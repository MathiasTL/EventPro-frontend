import { ContractDetailPage } from "@/pages/panel-contratos/detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractDetailPage key={id} contractId={id} />;
}
