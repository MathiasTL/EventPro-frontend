# Demo anterior con base local

**El entregable conectado a Supabase está documentado en [ENTREGABLE.md](ENTREGABLE.md).** El arranque por defecto usa Supabase y el backend en Windows. Esta guía describe únicamente el entorno anterior de PostgreSQL local aislado.

El proyecto real está en `eventpro-frontend/EventPro-frontend`. El flujo demostrado es la administración del catálogo y equipos contra el backend real, con login y permisos de encargado/superadmin.

## Preparación

Desde esta carpeta, con Docker Desktop activo y el `.env` del backend configurado:

```powershell
npm install
powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1 -LocalDatabase
npm run dev -- --port 3002
```

Abre http://localhost:3002/login. El script crea, si no existe, `admin@eventpro.pe` con la contraseña local de demo `Eventpro2026!`. Puedes cambiarla mediante `-DemoPassword`. Si esa cuenta ya existía, el bootstrap conserva su contraseña anterior.

La API está en http://localhost:8000/api/v1 y Swagger en http://localhost:8000/docs. `.env.local` puede definir `NEXT_PUBLIC_API_URL`; usa `.env.example` como referencia. El compose de demo utiliza puertos 55432 y 56379 para PostgreSQL y Redis, y volúmenes separados bajo el proyecto `eventpro-demo`.

## Guion

1. Iniciar sesión y mostrar el nombre y rol del administrador.
2. En Temáticas, crear “Selva Salvaje”.
3. En Paquetes, crear “Hora Loca Medium” con categoría Show, precio S/ 1000, costo S/ 450 y duración 60 minutos.
4. Crear inventario “Toldo 3x3” en categoría Toldos y stock 10. Volver a Paquetes → Vincular recursos: seleccionar la temática y cantidad 1 del toldo.
5. Crear extra “Gorila Gigante” y un elenco con nombre del líder y teléfono. Mostrar edición, búsqueda y baja lógica.
6. En Sobrecupo, aprobar el pago sintético de S/ 100 usando el evento `eeeeeeee-0000-4000-8000-000000000003`. El pago pasa a VERIFIED y desaparece de los pendientes. Rechazar lo deja en REFUND_PENDING.

El seed es idempotente y conserva decisiones ya tomadas. El evento de demo existe antes de aprobar: el override valida su existencia y no crea eventos. El comprobante es un marcador de prueba y no representa una transferencia real.

## Alcance y límites

- Los elencos se crean sin vínculo a un usuario operador: no existe un listado `/users` para seleccionarlo.
- El panel cubre catálogo, inventario, elencos y sobrecupo. La cotización por WhatsApp, contrato y firma pertenecen a otros módulos.
- El acceso se guarda en localStorage para este prototipo. Si vence, un 401 cierra la sesión y permite iniciar nuevamente.
- Los vínculos de temáticas e inventario se guardan mediante dos endpoints independientes. Si una operación falla, revisa los vínculos y vuelve a guardar.
- No uses las credenciales ni los datos sintéticos de esta demo en producción.

## Comprobaciones

```powershell
npm run lint
npm run build
..\..\eventpro\.venv\Scripts\python.exe scripts\verify-demo.py
```

El comprobador usa la API real y la base Docker de demo. Crea registros sintéticos, los da de baja y verifica aprobaciones y rechazos con pagos temporales. Conserva el pago pendiente del guion.
