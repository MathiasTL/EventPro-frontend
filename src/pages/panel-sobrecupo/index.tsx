"use client";

import { useState } from "react";
import { Notice, Page, PageHeader, Panel } from "@/shared/ui";
import { OverbookedPayments } from "./payments";

export function SobrecupoPage() {
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <Page>
      <PageHeader title="Sobrecupo" description="Decisiones pendientes de aprobación manual." />
      <Panel>
        {success && <div className="mb-4"><Notice tone="success">{success}</Notice></div>}
        <OverbookedPayments onSuccess={setSuccess} />
      </Panel>
    </Page>
  );
}
