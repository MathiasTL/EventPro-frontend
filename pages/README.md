# Directorio `pages/` (raíz)

Este directorio existe **únicamente** para que Next.js **no** interprete
`src/pages/` como *Pages Router* (ver `Docs/02-arquitectura/03-frontend-arquitectura-fsd.md`
sección 2.1, en el repositorio hermano `EventPro-backend`).

- El *App Router* real vive en `app/` (raíz): archivos de ruta delgados que
  reexportan las vistas de la capa FSD `src/pages/`.
- `src/pages/` es la **capa `pages` de FSD**, no un router de Next.js.
- No agregues archivos `.ts`/`.tsx`/`.js` aquí: solo documentación.
