import Link from "next/link";

export function ShowcaseFooter() {
  return (
    <footer className="showcase-footer">
      <div className="showcase-footer-inner">
        <p className="showcase-footer-name">EventPro<span aria-hidden="true">.</span></p>
        <p className="showcase-footer-context">Proyecto académico del equipo EventPro · Software Innovation Awards 2026 · FISI – UNMSM</p>
        <nav aria-label="Enlaces del pie de página" className="showcase-footer-nav">
          <Link href="/la-tremenda">Sitio del cliente</Link>
          <Link href="/login">Ingresar al panel</Link>
          <a href="#showcase-title">Volver arriba</a>
        </nav>
      </div>
    </footer>
  );
}
