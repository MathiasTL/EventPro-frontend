# Frontend E2: usuarios y auditorÃ­a

Primera entrega sobre `feat/e2-frontend`, creada desde `origin/develop` en `cd829f5`.

## Rutas e integraciÃ³n

- `/panel/users`: bÃºsqueda por nombre/correo/telÃ©fono, rol, estado y paginaciÃ³n mediante `GET /users`.
- `/panel/users/new`: creaciÃ³n mediante `POST /users`.
- `/panel/users/[id]`: consulta y ediciÃ³n mediante `GET/PATCH /users/{id}`. El correo no es editable. Solo se envÃ­an campos modificados; el propio usuario no puede cambiar su rol ni desactivar su cuenta. Cambiar la propia contraseÃ±a obliga a iniciar sesiÃ³n de nuevo.
- `/panel/audit-logs`: lectura mediante `GET /audit-logs`, con filtros por acciÃ³n, entidad, identificadores y fechas; detalle de valores anteriores/nuevos y horarios de Lima. No consulta `/users`, para permitir acceso al encargado.

Las rutas de usuarios estÃ¡n limitadas a SUPERADMIN. AuditorÃ­a admite SUPERADMIN y ENCARGADO. El backend sigue siendo la autoridad de permisos. Se reutilizan la sesiÃ³n, renovaciÃ³n de tokens y cachÃ© de TanStack Query de develop. No hay datos simulados ni dependencias nuevas.

## VerificaciÃ³n

```powershell
npm install
node --test scripts/e2-frontend.test.mjs
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

Las pruebas locales cubren montaje segÃºn rol, paginaciÃ³n invÃ¡lida y contratos de las peticiones de usuarios/auditorÃ­a. No reemplazan una prueba contra el backend.

ValidaciÃ³n manual pendiente: iniciar sesiÃ³n con SUPERADMIN/ENCARGADO/OPERADOR; verificar URLs directas, filtros, creaciÃ³n, duplicados, ediciÃ³n, activaciÃ³n/desactivaciÃ³n y errores. Revisar a 360 px y en escritorio, con backend configurado mediante `NEXT_PUBLIC_API_URL`. Comprobar la bitÃ¡cora despuÃ©s de modificar un usuario. No usar cuentas reales para las pruebas de desactivaciÃ³n.

## ContinuaciÃ³n

Contratos administrativos, contingencia manual y firma pÃºblica corresponden a las siguientes entregas. No se alterÃ³ el flujo existente de reservas manuales.


## Verificación de esta sesión (28 de octubre de 2026)

- Dependencias declaradas instaladas sin cambios de versiones ni del lockfile.
- Cinco pruebas aprobadas; lint, tipado y build aprobados.
- Se revisaron las peticiones de usuarios y auditoría frente a los routers y esquemas locales del backend.
- La validación visual y la integración real con backend siguen pendientes.
- `git fetch origin` funciona con permisos ampliados. En aislamiento falla con `cannot open '.git/FETCH_HEAD': Permission denied`; `git add` falla con `Unable to create .../.git/index.lock: Permission denied`. Los commits se crearon con permisos ampliados.
- El conector GitHub sigue rechazando crear `feat/e2-frontend` desde `develop`: `403 Resource not accessible by integration`. No se publicó la rama.
- Contratos PDF, contingencia manual y firma pública siguen pendientes en frontend. Se localizaron y consultaron sus routers y esquemas reales; se conserva el flujo `/manual-bookings`.
