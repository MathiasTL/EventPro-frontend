export function QuoteStep() {
  return (
    <div className="flow-artifact flow-quote-artifact">
      <div className="flow-artifact-bar"><span>Cotización</span><span>Combo Full Fiesta</span></div>
      <div className="flow-quote-body">
        <p className="flow-quote-package">Hora Loca + DJ</p>
        <div className="flow-quote-row"><span>Servicios</span><strong>S/ 1,000.00</strong></div>
        <div className="flow-quote-row"><span>Movilidad</span><strong>S/ 80.50</strong></div>
        <div className="flow-quote-total"><span>Total</span><strong>S/ 1,080.50</strong></div>
        <div className="flow-quote-advance"><span>Adelanto · 10 % de servicios</span><strong>S/ 100.00</strong></div>
      </div>
      <div className="flow-artifact-foot">Movilidad: S/ 1.00/km + S/ 0.30/min · mínimo S/ 20 · ×1.15.</div>
    </div>
  );
}
