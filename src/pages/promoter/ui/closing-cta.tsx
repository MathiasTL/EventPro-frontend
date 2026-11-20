import { WhatsAppAction } from "./actions";

export function ClosingCta() {
  return (
    <section className="promoter-closing" aria-labelledby="promoter-closing-title">
      <div className="promoter-container promoter-closing-inner">
        <div className="promoter-closing-burst" aria-hidden="true" />
        <h2 id="promoter-closing-title">El próximo gran recuerdo empieza contigo.</h2>
        <p>Cuéntanos qué estás planeando y armemos la celebración a tu medida.</p>
        <WhatsAppAction />
      </div>
    </section>
  );
}
