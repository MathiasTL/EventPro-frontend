"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, FileText } from "lucide-react";

import { ApiRequestError } from "@/shared/api/client";
import { formatShortDate } from "@/shared/lib/date";
import { formatSoles } from "@/shared/lib/format";
import { Button, ErrorBanner, Field, Input, LoadingState, Notice, Panel } from "@/shared/ui";
import { Wordmark } from "@/shared/ui/Wordmark";
import { getPublicContract, publicPdfUrl, requestOtp, submitSignature, verifyOtp } from "./api";
import { SignaturePad } from "./SignaturePad";

type Summary = Awaited<ReturnType<typeof getPublicContract>>;

const LINK_UNAVAILABLE =
  "El enlace ya no está disponible. Si acabas de firmar, consulta tu chat de WhatsApp. Si necesitas ayuda, escribe a EventPro.";

// The backend reports every 409 with the same `invalid-contract-state` code; the detail tells the reasons apart.
const CONTRACT_STATE_MESSAGES: Record<string, string> = {
  "El evento ya comenzó":
    "El evento ya comenzó, por lo que el contrato ya no puede firmarse en línea. Si necesitas ayuda, escribe a EventPro.",
  "Adelanto verificado insuficiente":
    "Todavía no se puede firmar porque el adelanto aún no está verificado. Escribe a EventPro por WhatsApp para revisarlo.",
  "PDF no disponible":
    "El contrato todavía no está listo para firmar. Inténtalo más tarde o escribe a EventPro por WhatsApp.",
};

function unavailable(error: unknown) {
  if (!(error instanceof ApiRequestError)) return null;
  if (error.code === "signature-token-expired") {
    return "El enlace venció. Pide a EventPro un nuevo enlace por WhatsApp.";
  }
  if (error.code === "invalid-contract-state") {
    return CONTRACT_STATE_MESSAGES[error.message] ?? LINK_UNAVAILABLE;
  }
  if (error.status === 404) return LINK_UNAVAILABLE;
  return null;
}

function errorMessage(error: unknown) {
  return error instanceof ApiRequestError ? error.message : "Ocurrió un error. Inténtalo nuevamente.";
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="ep-panel flex flex-1 flex-col bg-ep-wash">
      <header className="border-b border-ep-line bg-ep-pass">
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6"><Wordmark tone="light" /></div>
      </header>
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 sm:px-6 sm:py-9">{children}</div>
    </main>
  );
}

export function SignContract({ token }: { token: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadError, setLoadError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    getPublicContract(token).then(
      (data) => { if (active) setSummary(data); },
      (error: unknown) => {
        if (!active) return;
        const message = unavailable(error);
        setLoadError({ message: message ?? errorMessage(error), retryable: message === null });
      },
    );
    return () => { active = false; };
  }, [token, reload]);

  return (
    <Shell>
      {summary ? <SigningForm token={token} summary={summary} /> : (
        <Panel className="space-y-3">
          <h1 className="ep-cond text-3xl text-ep-ink">Firma de contrato</h1>
          {loadError ? (
            <>
              <ErrorBanner message={loadError.message} />
              {loadError.retryable && (
                <Button type="button" variant="ghost" onClick={() => { setLoadError(null); setReload(reload + 1); }}>
                  Reintentar
                </Button>
              )}
            </>
          ) : <LoadingState label="Cargando contrato…" />}
        </Panel>
      )}
    </Shell>
  );
}

function SigningForm({ token, summary }: { token: string; summary: Summary }) {
  const [phoneHint, setPhoneHint] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [code, setCode] = useState("");
  const [proof, setProof] = useState("");
  const [name, setName] = useState(summary.client_full_name);
  const [accepted, setAccepted] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const [signedNumber, setSignedNumber] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (error) {
      const terminal = unavailable(error);
      if (terminal) {
        setTerminalError(terminal);
      } else {
        if (error instanceof ApiRequestError) {
          if (error.code === "otp-expired" || error.code === "otp-attempts-exceeded") {
            setProof("");
            setPhoneHint("");
            setCode("");
            setHasInk(false);
          } else if (error.status === 401 && error.code === "invalid-otp") {
            setProof("");
            setCode("");
            setHasInk(false);
          }
        }
        setError(errorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  }

  function sendCode() {
    void run(async () => {
      const challenge = await requestOtp(token);
      setProof("");
      setCode("");
      setHasInk(false);
      setPhoneHint(challenge.phone_hint);
      setResendAt(Date.now() + challenge.resend_available_in * 1000);
      setSeconds(challenge.resend_available_in);
    });
  }

  function checkCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      const result = await verifyOtp(token, code);
      setCode("");
      setProof(result.otp_proof);
    });
  }

  function sign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || !canvas.current || !hasInk || name.trim().length < 2) return;
    const image = canvas.current.toDataURL("image/png");
    void run(async () => {
      const result = await submitSignature(token, proof, image, name.trim());
      setProof("");
      setSignedNumber(result.contract_number);
    });
  }

  if (signedNumber) return (
    <Panel className="space-y-3">
      <CheckCircle2 className="text-ep-success" aria-hidden="true" size={32} />
      <h1 className="ep-cond text-3xl text-ep-ink">Contrato firmado</h1>
      <p role="status" className="text-sm text-ep-body">
        Tu contrato {signedNumber} se guardó. La copia firmada quedó en cola para enviarse a tu WhatsApp.
      </p>
    </Panel>
  );

  if (terminalError) return (
    <Panel className="space-y-3">
      <h1 className="ep-cond text-3xl text-ep-ink">Firma de contrato</h1>
      <ErrorBanner message={terminalError} />
    </Panel>
  );

  const { event } = summary;
  const details = [
    ["Cliente", summary.client_full_name],
    ["Servicio", [event.package_name, event.theme_name].filter(Boolean).join(" · ")],
    ["Fecha y hora (Lima)", `${formatShortDate(event.event_date)} · ${event.start_time.slice(0, 5)} a ${event.end_time.slice(0, 5)}`],
    ["Lugar", `${event.address}, ${event.district}`],
    ["Total", formatSoles(summary.total_amount)],
    ["Adelanto cobrado", formatSoles(summary.advance_paid)],
    ["Saldo pendiente", formatSoles(summary.pending_balance)],
  ];

  return (
    <>
      <Panel className="space-y-5">
        <header>
          <p className="text-sm font-medium text-ep-mute">{summary.contract_number}</p>
          <h1 className="ep-cond mt-1 text-3xl text-ep-ink">Firma tu contrato</h1>
        </header>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}><dt className="text-ep-mute">{label}</dt><dd className="break-words font-medium text-ep-ink">{value}</dd></div>
          ))}
        </dl>
        {event.client_observations && (
          <div className="text-sm">
            <h2 className="font-semibold text-ep-ink">Observaciones</h2>
            <p className="mt-1 whitespace-pre-wrap break-words text-ep-body">{event.client_observations}</p>
          </div>
        )}
        <a href={publicPdfUrl(token)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ep-line-strong px-3.5 text-sm font-semibold text-ep-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-ep-magenta">
          <FileText size={16} aria-hidden="true" /> Abrir contrato PDF
        </a>
      </Panel>
      <Panel className="space-y-4">
        <h2 className="text-lg font-semibold text-ep-ink">{proof ? "Completa tu firma" : "Confirma tu número de WhatsApp"}</h2>
        <ErrorBanner message={error} />
        {proof ? (
          <form className="space-y-4" onSubmit={sign}>
            <Notice tone="success">Código verificado.</Notice>
            <Field label="Nombre completo">
              <Input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={120} autoComplete="name" disabled={busy} />
            </Field>
            <SignaturePad canvasRef={canvas} disabled={busy} hasInk={hasInk} onInkChange={setHasInk} />
            <label className="flex items-start gap-2 text-sm text-ep-ink">
              <input type="checkbox" className="mt-0.5 size-4 accent-ep-magenta" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} disabled={busy} required />
              He leído el contrato y acepto firmarlo electrónicamente.
            </label>
            <Button type="submit" disabled={busy || !accepted || !hasInk || name.trim().length < 2}>
              {busy ? "Firmando…" : "Firmar contrato"}
            </Button>
          </form>
        ) : (
          <>
            {phoneHint ? (
              <form className="space-y-3" onSubmit={checkCode}>
                <p className="text-sm text-ep-body">Escribe el código de seis dígitos solicitado para tu WhatsApp {phoneHint}.</p>
                <Field label="Código de verificación">
                  <Input className="max-w-52 tracking-widest" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} disabled={busy} required />
                </Field>
                <Button type="submit" disabled={busy || code.length !== 6}>Verificar código</Button>
              </form>
            ) : <p className="text-sm text-ep-body">Solicita un código de verificación antes de firmar.</p>}
            <Button type="button" variant={phoneHint ? "ghost" : "primary"} onClick={sendCode} disabled={busy || seconds > 0}>
              {seconds > 0 ? `Solicitar un nuevo código en ${seconds} s` : phoneHint ? "Solicitar un nuevo código" : "Solicitar código por WhatsApp"}
            </Button>
          </>
        )}
      </Panel>
    </>
  );
}
