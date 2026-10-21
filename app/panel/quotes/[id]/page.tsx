import { QuoteDetailPage } from "@/pages/quotes/detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuoteDetailPage key={id} quoteId={id} />;
}
