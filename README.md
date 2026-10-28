# EventPro — Frontend

Panel administrativo y agenda operativa de EventPro, una promotora de eventos. Es el cliente web (Next.js 16, App Router) de la API REST del backend de EventPro (FastAPI). No tiene base de datos propia: todo el estado vive en el backend, y este proyecto solo consume su API vía JSON (y `multipart/form-data` para subir evidencias).

Arquitectura: **Feature-Sliced Design (FSD)**. El detalle de las capas y sus reglas de dependencia está en `Docs/02-arquitectura/03-frontend-arquitectura-fsd.md` del repositorio del backend.

## Cómo levantarlo

Requisitos: Node.js 20+, y el backend de EventPro corriendo (ver su propio README; normalmente expone la API en `http://localhost:8000/api/v1`).

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. La página raíz (`/`) redirige a `/login`.

Otros comandos:

```bash
npm run build   # build de producción (Turbopack)
npm run start   # sirve el build de producción
npm run lint    # ESLint (flat config, eslint-config-next)
```

## Variables de entorno

| Variable | Default si falta | Para qué sirve |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base URL de la API del backend. Se usa en cada `fetch` de `shared/api/client.ts`. |

Copia `.env.example` a `.env.local` y ajusta `NEXT_PUBLIC_API_URL` si el backend no corre en `localhost:8000`.

No hay más variables: el frontend no tiene credenciales ni secretos propios — la sesión (access/refresh token) se guarda en `localStorage` del navegador tras el login contra el backend.

## Sesión y seguridad

- Login (`POST /auth/login`) guarda `access_token` y `refresh_token` en `localStorage`.
- Si una petición responde `401`, el cliente HTTP (`shared/api/client.ts`) intenta `POST /auth/refresh` una vez; si funciona, reintenta la petición original. Si falla, cierra la sesión y redirige a `/login`.
- "Salir" llama a `POST /auth/logout` (revoca el refresh token en el backend) y limpia `localStorage`.
- Las rutas protegidas usan guards client-side (`src/app/routes/RequireAuth.tsx`, `RequireRole.tsx`) porque la sesión vive en `localStorage`, no en cookies — esta versión de Next.js (16) ya no tiene `middleware.ts` (ahora se llama `proxy.ts`), pero tampoco aplicaría aquí: el servidor no puede leer `localStorage`.

## Rutas y roles

El backend reconoce tres roles con cuenta (`SUPERADMIN`, `ENCARGADO`, `OPERADOR`); `CLIENTE` no tiene cuenta ni acceso al panel. La matriz completa está en `Docs/04-api/02-matriz-rbac-y-seguridad.md` del backend; en el frontend se traduce así:

| Ruta | Quién entra | Qué hace |
| --- | --- | --- |
| `/login` | Público | Inicio de sesión. Redirige por rol: `OPERADOR` → `/agenda`, el resto → `/panel`. |
| `/agenda` | Cualquier usuario autenticado | Agenda del operador para el día: iniciar show, registrar extensión con evidencia, liquidar evento. Mobile-first (US-17, US-18). |
| `/panel` | `ENCARGADO`, `SUPERADMIN` (si no, redirige a `/agenda`) | Redirige a `/panel/solicitudes`. |
| `/panel/solicitudes` | `ENCARGADO`, `SUPERADMIN` | Cotizar, registrar adelanto, validar y generar contrato/reserva manual. |
| `/panel/catalogo` | `ENCARGADO`, `SUPERADMIN` | CRUD de paquetes, temáticas, extras, inventario y elencos. |
| `/panel/sobrecupo` | `ENCARGADO`, `SUPERADMIN` | Aprobar o rechazar pagos que superan el umbral de shows simultáneos. |
| `/panel/cronograma` | `ENCARGADO`, `SUPERADMIN` | Cronograma por día/semana con observaciones del cliente destacadas (US-16). |
| `/panel/finanzas` | `ENCARGADO`, `SUPERADMIN` | Reporte P&L (ingresos, costos, utilidad) por mes o semana ISO (US-21). |
| `/panel/usuarios` | Solo `SUPERADMIN` | Alta, edición, activación/desactivación de cuentas del panel (US-23). |
| `/panel/auditoria` | `ENCARGADO`, `SUPERADMIN` | Bitácora de acciones críticas, de solo lectura, con filtros (US-24). |
| `/panel/conversations` | `ENCARGADO`, `SUPERADMIN` | Bandeja de conversaciones de WhatsApp y detalle del hilo. |
| `/panel/quotes` | `ENCARGADO`, `SUPERADMIN` | Bandeja de cotizaciones y detalle en `/panel/quotes/[id]`. |
| `/panel/pagos` | `ENCARGADO`, `SUPERADMIN` | Entrada preparada en el menú; módulo aún no implementado (verificación/auditoría/reembolso de pagos). |

La barra de navegación del panel (`src/app/routes/PanelNav.tsx`, único encabezado del panel) ya filtra qué módulos ve cada rol; los guards (`src/app/routes`) son la defensa real en caso de navegación directa por URL.

## Estructura (FSD)

```
app/                 # Next.js App Router: solo layouts (guards) y reexports delgados de src/pages
src/
  app/providers/      # Providers de la aplicación (AuthProvider; el contexto y `useAuth` viven en `entities/auth/context`)
  app/routes/         # Guards de ruta (RequireAuth, RequireRole)
  pages/              # Una pantalla por carpeta, compone widgets/features/entities
  widgets/            # Bloques de UI reutilizables entre páginas (tablas, calendario, bandejas)
  features/           # Una acción de usuario por carpeta (iniciar show, registrar extensión, liquidar evento)
  entities/           # Modelo de dominio: tipos + llamadas a la API (event, user, audit-log, financial, catalog, payment, auth)
  shared/             # Cliente HTTP, utilidades de fecha/formato/descarga, componentes de UI genéricos
```

## Cotizaciones

El panel incorpora `/panel/quotes` (estados, cliente, fechas del evento y paginación)
y `/panel/quotes/[id]` (detalle, importes congelados, observaciones y pagos relacionados).
Requiere `ENCARGADO` o `SUPERADMIN` y consume la API real mediante `NEXT_PUBLIC_API_URL`.
Las fechas del evento y los vencimientos se muestran en hora de Lima.

El backend debe incluir los casos reales de la spec 08 y la migración
`0006_quote_observations`. Este módulo consulta `GET /quotes` y `GET /quotes/{id}`;
las acciones de adelanto y cancelación se integrarán con la entrega de Christian.

Validación: `npm run lint`, `npx tsc --noEmit` y `npm run build`.

## Documentación relacionada

- `DEMO.md` / `ENTREGABLE.md`: guiones de demo históricos (entorno local y Supabase).
- `AGENTS.md`: nota sobre cambios de Next.js 16 para quien edite el código con un agente.
