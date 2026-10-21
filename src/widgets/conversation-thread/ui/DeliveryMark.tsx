import type { DeliveryStatus } from "@/entities/message";
import { deliveryLabels } from "../model";

type Props = {
  status: DeliveryStatus | "QUEUED" | null;
  /** Own bubbles sit on a violet background and need lighter marks. */
  onDark?: boolean;
};

function Check({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 11" className={`h-3 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5 4.5 9 11 1.5" />
    </svg>
  );
}

function DoubleCheck({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 11" className={`h-3 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5 4.5 9 11 1.5M8 8.2 9 9 15.5 1.5" />
    </svg>
  );
}

/** One check SENT, two DELIVERED, two highlighted READ, red alert FAILED; the text label is always available. */
export function DeliveryMark({ status, onDark = false }: Props) {
  if (status === null) return null;
  const quiet = onDark ? "text-white/75" : "text-zinc-500";
  const label = status === "QUEUED" ? "Enviando" : deliveryLabels[status];
  let icon;
  if (status === "QUEUED") {
    icon = (
      <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3 w-3 ${quiet}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" />
      </svg>
    );
  } else if (status === "SENT") icon = <Check className={quiet} />;
  else if (status === "DELIVERED") icon = <DoubleCheck className={quiet} />;
  else if (status === "READ") icon = <DoubleCheck className={onDark ? "text-sky-300" : "text-sky-600"} />;
  else {
    icon = (
      <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${onDark ? "text-red-200" : "text-red-600"}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5v4M8 11v.5" />
      </svg>
    );
  }
  return (
    <span className="inline-flex items-center" title={label}>
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  );
}
