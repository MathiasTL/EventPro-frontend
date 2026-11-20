import { ArrowDownRight } from "lucide-react";

import { WhatsAppAction } from "./actions";

export function Hero() {
  return (
    <section className="promoter-hero" aria-labelledby="promoter-title">
      <div className="promoter-hero-inner">
        <div className="promoter-hero-copy">
          <h1 id="promoter-title">Que tu evento se sienta <em>en grande.</em></h1>
          <p>Shows, música y detalles para cumpleaños, baby showers, fiestas infantiles y eventos corporativos en Lima.</p>
          <div className="promoter-hero-actions">
            <WhatsAppAction />
            <span>Cotización en el chat, con movilidad incluida.</span>
          </div>
        </div>
        <div className="promoter-hero-art" aria-hidden="true">
          <div className="promoter-hero-circle"><span>¡A<br />celebrar!</span></div>
          <div className="promoter-hero-spark promoter-hero-spark-one" />
          <div className="promoter-hero-spark promoter-hero-spark-two" />
          <div className="promoter-hero-art-note"><span>SHOWS</span><span>MÚSICA</span><span>AMBIENTACIÓN</span></div>
          <span className="promoter-hero-loop promoter-hero-loop-one" />
          <span className="promoter-hero-loop promoter-hero-loop-two" />
        </div>
      </div>
      <a href="#servicios" className="promoter-hero-next">Descubre los servicios <ArrowDownRight aria-hidden="true" size={20} /></a>
    </section>
  );
}
