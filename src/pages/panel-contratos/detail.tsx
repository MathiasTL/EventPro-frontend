"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import {
  contractKeys, downloadContractPdf, getContract, issueContract, resendContractLink,
  updateContractObservations, voidContract, type ContractDetail,
} from "@/entities/contract/api";
import { formatLimaDateTime } from "@/shared/lib/date";
import { triggerBlobDownload } from "@/shared/lib/download";
import { Button, ErrorBanner, Field, LoadingState, Modal, Notice, Page, PageHeader, Panel, Textarea } from "@/shared/ui";
import { contractError, ContractStatusBadge } from "./ui";

type Action =
  | { type: "issue" | "resend" | "download" }
  | { type: "observations"; value: string | null }
  | { type: "void"; reason: string };

function BackLink() {
  return <Link href="/panel/contratos" className="text-sm font-semibold text-ep-ink underline underline-offset-4 hover:text-ep-magenta">Volver a contratos</Link>;
}

export function ContractDetailPage({ contractId }: { contractId: string }) {
  const query = useQuery({ queryKey: contractKeys.detail(contractId), queryFn: () => getContract(contractId) });

  return (
    <Page className="max-w-4xl">
      <BackLink />
      {query.isPending && <LoadingState label="Cargando contrato…" />}
      {query.isError && (
        <div className="space-y-3">
          <ErrorBanner message={contractError(query.error)} />
          <Button type="button" variant="ghost" onClick={() => void query.refetch()}>Reintentar</Button>
        </div>
      )}
      {query.data && <ContractDetailContent contract={query.data} />}
    </Page>
  );
}

function ContractDetailContent({ contract }: { contract: ContractDetail }) {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [reason, setReason] = useState("");
  const id = contract.contract_id;
  const editable = contract.status === "DRAFT" || contract.status === "ISSUED";

  const operation = useMutation({
    mutationFn: async (action: Action) => {
      switch (action.type) {
        case "issue":
          await issueContract(contract.event_id);
          return "Contrato emitido. El enlace quedó en cola de envío.";
        case "resend":
          await resendContractLink(id);
          return "El nuevo enlace quedó en cola de envío. El anterior perdió vigencia.";
        case "observations":
          await updateContractObservations(id, action.value);
          return contract.status === "ISSUED"
            ? "Observaciones guardadas. El enlace actualizado quedó en cola de envío."
            : "Observaciones guardadas.";
        case "void":
          await voidContract(id, action.reason);
          return "Contrato anulado.";
        case "download": {
          const blob = await downloadContractPdf(id);
          triggerBlobDownload(blob, `${contract.contract_number}${contract.signed_at ? "-firmado" : ""}.pdf`);
          return null;
        }
      }
    },
    onMutate: () => setNotice(null),
    onSuccess: async (message, action) => {
      if (action.type !== "download") await queryClient.invalidateQueries({ queryKey: contractKeys.all });
      if (action.type === "void") {
        setVoidOpen(false);
        setReason("");
      }
      setNotice(message);
    },
  });

  function closeVoid() {
    if (operation.isPending) return;
    operation.reset();
    setVoidOpen(false);
    setReason("");
  }

  const error = operation.isError ? contractError(operation.error) : null;
  const busy = operation.isPending;
  return (
    <>
      <PageHeader title={contract.contract_number} actions={<ContractStatusBadge status={contract.status} />} />
      {notice && <Notice tone="success">{notice}</Notice>}
      {!voidOpen && <ErrorBanner message={error} />}
      <Panel className="space-y-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-ep-mute">Evento</dt><dd className="break-all text-ep-ink">{contract.event_id}</dd></div>
          <div><dt className="text-ep-mute">Modo</dt><dd className="text-ep-ink">{contract.is_manual_mode ? "Manual" : "Automático"}</dd></div>
          <div><dt className="text-ep-mute">Registrado (Lima)</dt><dd className="text-ep-ink">{formatLimaDateTime(contract.created_at)}</dd></div>
          {contract.signed_at && <div><dt className="text-ep-mute">Firmado (Lima)</dt><dd className="text-ep-ink">{formatLimaDateTime(contract.signed_at)}</dd></div>}
          {contract.signature_token_expires_at && <div><dt className="text-ep-mute">Vencimiento del enlace (Lima)</dt><dd className="text-ep-ink">{formatLimaDateTime(contract.signature_token_expires_at)}</dd></div>}
        </dl>
        {contract.custom_clauses && (
          <div className="text-sm">
            <h2 className="font-semibold text-ep-ink">Cláusulas particulares</h2>
            <p className="mt-1 whitespace-pre-wrap break-words text-ep-body">{contract.custom_clauses}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {contract.status === "DRAFT" && <Button type="button" disabled={busy} onClick={() => operation.mutate({ type: "issue" })}>Emitir contrato</Button>}
          {contract.status !== "DRAFT" && <Button type="button" disabled={busy} onClick={() => operation.mutate({ type: "download" })}>Descargar PDF</Button>}
          {contract.status === "ISSUED" && <Button type="button" variant="ghost" disabled={busy} onClick={() => operation.mutate({ type: "resend" })}>Reenviar enlace</Button>}
          {contract.status !== "VOIDED" && <Button type="button" variant="ghost" disabled={busy} onClick={() => { operation.reset(); setVoidOpen(true); }}>Anular contrato</Button>}
        </div>
      </Panel>
      <Panel className="space-y-3">
        <h2 className="text-lg font-semibold text-ep-ink">Observaciones</h2>
        {editable ? (
          <ObservationForm
            key={JSON.stringify(contract.client_observations)}
            initial={contract.client_observations}
            busy={busy}
            onSave={(value) => operation.mutate({ type: "observations", value })}
          />
        ) : <p className="whitespace-pre-wrap break-words text-sm text-ep-body">{contract.client_observations || "Sin observaciones."}</p>}
      </Panel>
      <Modal open={voidOpen} title="Anular contrato" onClose={closeVoid}>
        <form onSubmit={(event) => { event.preventDefault(); operation.mutate({ type: "void", reason: reason.trim() }); }} className="space-y-4">
          <Field label="Motivo de la anulación">
            <Textarea autoFocus rows={3} required maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} disabled={busy} />
          </Field>
          <ErrorBanner message={error} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeVoid} disabled={busy}>Cancelar</Button>
            <Button type="submit" variant="danger" disabled={busy || !reason.trim()}>Confirmar anulación</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function ObservationForm({ initial, busy, onSave }: { initial: string | null; busy: boolean; onSave: (value: string | null) => void }) {
  const [value, setValue] = useState(initial ?? "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!busy && value !== (initial ?? "")) onSave(value || null);
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Notas del evento que aparecen en el PDF">
        <Textarea rows={4} maxLength={5000} value={value} onChange={(event) => setValue(event.target.value)} disabled={busy} />
      </Field>
      <Button type="submit" variant="ghost" disabled={busy || value === (initial ?? "")}>Guardar observaciones</Button>
    </form>
  );
}
