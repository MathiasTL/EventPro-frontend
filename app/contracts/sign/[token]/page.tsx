import type { Metadata } from "next";

import { SignContract } from "@/features/sign-contract/SignContract";

export const metadata: Metadata = {
  title: "Firma de contrato | EventPro",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SignContract key={token} token={token} />;
}
