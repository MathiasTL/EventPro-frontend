import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="promoter-footer">
      <div className="promoter-container promoter-footer-inner">
        <div><strong>La Tremenda.</strong><span>Shows y eventos · Lima, Perú</span></div>
        <nav aria-label="Pie de página"><a href="#servicios">Servicios</a><a href="#como-funciona">Cómo funciona</a><Link href="/login">Acceso del equipo</Link></nav>
      </div>
    </footer>
  );
}
