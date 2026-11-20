const team = [
  { name: "Mathias James Torres Lezama", role: "Líder Técnico" },
  { name: "Luis David Morales Brenis", role: "Desarrollador Full Stack" },
  { name: "Alan Nicolás García Avalos", role: "Desarrollador Full Stack" },
  { name: "Renzo Pedro Cordero Alfaro", role: "Desarrollador Frontend" },
] as const;

export function TeamSection() {
  return (
    <section className="showcase-team" aria-labelledby="team-title">
      <div className="showcase-section-inner">
        <div className="showcase-section-heading showcase-team-heading">
          <h2 id="team-title">Detrás del sistema, un equipo.</h2>
          <p>EventPro es un proyecto académico presentado al Software Innovation Awards 2026 de la FISI – UNMSM.</p>
        </div>
        <div className="showcase-team-list">
          {team.map(({ name, role }) => (
            <div key={name}>
              <h3 className="ep-cond">{name}</h3>
              <p>{role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
