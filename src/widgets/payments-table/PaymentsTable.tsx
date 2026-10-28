import { PAYMENT_METHOD_LABELS, PaymentAuditBadge, PaymentConceptBadge, PaymentStatusBadge, type PaymentRead } from "@/entities/payment";
import { formatLimaDateTime } from "@/shared/lib/date";
import { formatSoles } from "@/shared/lib/format";
import { Table } from "@/shared/ui";

export function PaymentsTable({ payments, onView }: { payments: PaymentRead[]; onView: (payment: PaymentRead) => void }) {
  return (
    <Table head={["ID", "Concepto", "Monto", "Método", "Validación", "Auditoría", "Fecha", ""]}>
      {payments.map(payment => (
        <tr key={payment.payment_id}>
          <td className="px-4 py-4 font-mono text-xs text-zinc-500">{payment.payment_id.slice(0, 8)}</td>
          <td className="px-4 py-4"><PaymentConceptBadge concept={payment.concept} /></td>
          <td className="px-4 py-4 text-sm font-medium text-zinc-900">{formatSoles(payment.amount)}</td>
          <td className="px-4 py-4 text-sm text-zinc-600">{PAYMENT_METHOD_LABELS[payment.payment_method]}</td>
          <td className="px-4 py-4"><PaymentStatusBadge status={payment.validation_status} /></td>
          <td className="px-4 py-4"><PaymentAuditBadge status={payment.audit_status} /></td>
          <td className="px-4 py-4 text-sm text-zinc-600">{formatLimaDateTime(payment.created_at)}</td>
          <td className="px-4 py-4"><button type="button" onClick={() => onView(payment)} className="text-sm font-medium text-violet-700 hover:underline">Ver detalle</button></td>
        </tr>
      ))}
    </Table>
  );
}
