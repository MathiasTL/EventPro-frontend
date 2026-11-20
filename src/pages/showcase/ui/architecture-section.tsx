import { ArrowDown, ArrowRight } from "lucide-react";

const pipeline = [
  { label: "Canal", name: "WhatsApp Cloud API", detail: "Mensajes del cliente" },
  { label: "Gateway oculto", name: "Chatwoot", detail: "Conserva el hilo y entrega los mensajes" },
  { label: "Núcleo hexagonal", name: "FastAPI", detail: "Reglas de negocio y control humano" },
  { label: "Persistencia", name: "PostgreSQL", detail: "Eventos, contratos, pagos y catálogo" },
] as const;

const connections = [
  { label: "Interfaz", name: "Next.js", detail: "Panel y vistas móviles · Vercel" },
  { label: "Tareas", name: "Redis + arq", detail: "Worker de outbox y reintentos" },
  { label: "Movilidad", name: "Google Maps", detail: "Distancia y tiempo de ruta" },
  { label: "Contratos", name: "ReportLab + OTP", detail: "PDF y firma electrónica" },
] as const;

export function ArchitectureSection() {
  return (
    <section id="arquitectura" className="showcase-architecture" aria-labelledby="architecture-title">
      <div className="showcase-section-inner">
        <div className="showcase-section-heading showcase-architecture-heading">
          <h2 id="architecture-title">Cada integración tiene su lugar.</h2>
          <p>El núcleo de negocio está separado del canal, la interfaz y los servicios externos.</p>
        </div>

        <div className="showcase-architecture-diagram" aria-label="Arquitectura de EventPro">
          <ol className="showcase-architecture-pipeline">
            {pipeline.map(({ label, name, detail }, index) => (
              <li key={name}>
                <div className="showcase-architecture-node">
                  <span>{label}</span>
                  <strong>{name}</strong>
                  <p>{detail}</p>
                </div>
                {index < pipeline.length - 1 && <span className="showcase-architecture-arrow" aria-hidden="true"><ArrowRight className="showcase-arrow-right" /><ArrowDown className="showcase-arrow-down" /></span>}
              </li>
            ))}
          </ol>

          <div className="showcase-architecture-core-note">Backend y gateway en Oracle VM</div>
          <h3>Conectado al núcleo</h3>
          <div className="showcase-architecture-connections">
            {connections.map(({ label, name, detail }) => (
              <div key={name} className="showcase-architecture-connection">
                <span>{label}</span>
                <strong>{name}</strong>
                <p>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
