import { FileText, Fingerprint } from "lucide-react";

export function ContractStep() {
  return (
    <div className="flow-artifact flow-contract-artifact">
      <div className="flow-artifact-bar"><span>Contrato digital</span><span>Firma desde el celular</span></div>
      <div className="flow-contract-body">
        <div className="flow-contract-document">
          <div className="flow-contract-document-head"><FileText aria-hidden="true" /><strong>Contrato PDF</strong></div>
          <p>Combo Full Fiesta (Hora Loca + DJ)</p>
          <div className="flow-contract-rule" />
          <div className="flow-contract-rule flow-contract-rule-short" />
          <div className="flow-contract-signature"><Fingerprint aria-hidden="true" /><span>Firma con código OTP</span></div>
        </div>
        <div className="flow-contract-status">Documento firmado</div>
      </div>
      <div className="flow-artifact-foot">El PDF firmado queda unido a la solicitud.</div>
    </div>
  );
}
