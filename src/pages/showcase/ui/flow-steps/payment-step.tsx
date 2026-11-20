import { Check, CircleDashed, Wallet } from "lucide-react";

export function PaymentStep() {
  return (
    <div className="flow-artifact flow-payment-artifact">
      <div className="flow-artifact-bar"><span>Adelanto</span><span>Verificación humana</span></div>
      <div className="flow-payment-body">
        <div className="flow-payment-amount"><span>Adelanto solicitado</span><strong>S/ 100.00</strong></div>
        <div className="flow-payment-track">
          <div className="flow-payment-stage"><Wallet aria-hidden="true" /><span>Yape o Plin</span><strong>Comprobante enviado</strong></div>
          <div className="flow-payment-stage flow-payment-review"><CircleDashed aria-hidden="true" /><span>Encargado</span><strong>Revisa el pago</strong></div>
          <div className="flow-payment-stage flow-payment-verified"><Check aria-hidden="true" /><span>Resultado</span><strong>Adelanto validado</strong></div>
        </div>
      </div>
      <div className="flow-artifact-foot">La aprobación no se automatiza: la hace el encargado.</div>
    </div>
  );
}
