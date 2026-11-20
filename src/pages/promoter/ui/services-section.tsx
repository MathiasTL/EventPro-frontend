import { PROMOTER_EXTRAS, PROMOTER_PACKAGES, formatSoles } from "../model/catalog";

function PackageList({ group }: { group: "hora-loca" | "other" }) {
  return (
    <ul className="promoter-package-list">
      {PROMOTER_PACKAGES.filter((item) => item.group === group).map((item) => (
        <li key={item.name}>
          <span>{item.name}</span>
          <strong>desde S/ {formatSoles(item.price)}</strong>
        </li>
      ))}
    </ul>
  );
}

export function ServicesSection() {
  return (
    <section id="servicios" className="promoter-services" aria-labelledby="promoter-services-title">
      <div className="promoter-container">
        <div className="promoter-services-intro">
          <h2 id="promoter-services-title">Elige cómo quieres celebrar.</h2>
          <p>Desde una Hora Loca hasta la ambientación completa: tú pones la ocasión y nosotros te ayudamos a darle forma.</p>
        </div>
        <div className="promoter-package-columns">
          <div className="promoter-package-group">
            <h3>Hora Loca</h3>
            <PackageList group="hora-loca" />
          </div>
          <div className="promoter-package-group">
            <h3>Shows y producción</h3>
            <PackageList group="other" />
          </div>
        </div>
        <p className="promoter-services-more">También puedes consultar por MC, decoración temática y personajes gigantes.</p>
        <p className="promoter-services-note">El precio final considera los servicios que elijas y la movilidad hasta tu evento.</p>
      </div>
      <div className="promoter-extras">
        <div className="promoter-container promoter-extras-inner">
          <div>
            <h3>Extras que sorprenden.</h3>
            <p>Súmale ese detalle que todos recordarán.</p>
          </div>
          <ul>
            {PROMOTER_EXTRAS.map((item) => (
              <li key={item.name}><span>{item.name}</span><strong>desde S/ {formatSoles(item.price)}</strong></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
