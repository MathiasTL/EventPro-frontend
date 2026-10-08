# EventPro: solicitud manual → reserva → contrato

El frontend consume la API real de EventPro; el backend conecta a PostgreSQL en Supabase con SQLAlchemy/asyncpg. Las credenciales de la base nunca llegan al navegador.

## Arranque en Windows

El `.env` privado de `eventpro` contiene `DATABASE_URL` de Supabase con SSL y las credenciales privadas del administrador. Configura también `CORS_ORIGINS=http://localhost:3002,http://127.0.0.1:3002`, `REDIS_HOST=127.0.0.1`, `REDIS_PORT=56379` y `REDIS_PASSWORD=`.

Desde `eventpro`, instala dependencias del backend:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Desde `eventpro-frontend/EventPro-frontend`:

```powershell
npm install
powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1
npm run dev -- --port 3002
```

Abre http://localhost:3002/login. Usa `admin@eventpro.pe` y la contraseña privada del entorno Supabase entregada al equipo. La contraseña de la demo local anterior no corresponde a este entorno.

El script inicia Redis en Docker y el backend en el venv de Windows, verifica `alembic current` y conserva el esquema y los datos compartidos. No ejecuta seeds ni migraciones en Supabase. Cierra el backend anterior si ya hay un proceso en el puerto 8000. La API está en http://localhost:8000/docs.

El frontend usa `NEXT_PUBLIC_API_URL` de `.env.local`; `.env.example` solo contiene la URL pública de la API.

La conexión directa funciona desde Windows en esta máquina. Docker carece de la ruta necesaria para esa dirección. En una red compatible puedes usar `scripts/start-demo.ps1 -DockerBackend`. El worker programado aún no está implementado y este proceso no depende de él.

## Guion para el profesor

1. **Solicitud:** en Solicitudes, ingresa nombre, teléfono, distrito, dirección, fecha y hora futura. Selecciona paquete, temática compatible y extras del catálogo real.
2. **Presupuesto automático:** confirma que el cliente proporciona transporte de ida y vuelta. Generar presupuesto valida datos, consulta disponibilidad, obtiene los precios de Supabase y calcula total, adelanto del 10% sobre servicios y saldo. Produce un PDF descargable.
3. **Comprobante:** adjunta JPEG/PNG/WebP/PDF de hasta 5 MiB, medio e importe recibido. Registrar adelanto pendiente guarda cliente, cotización manual, detalle de extras y pago `PENDING_VERIFICATION`. Aún no reserva.
4. **Revisión humana:** descarga el comprobante desde Solicitudes y contratos recientes y comprueba la recepción del dinero. Pulsa Validar adelanto y reservar, y confirma la revisión.
5. **Reserva y contrato automáticos:** el backend revalida disponibilidad en una transacción, valida el importe, crea el evento `AWAITING_SIGNATURE`, reserva el inventario, marca el pago `VERIFIED`, convierte la cotización a `CONVERTED`, genera y guarda el contrato `ISSUED` y registra la acción en bitácora.
6. **Resultado:** descarga el contrato. Recarga el navegador: la solicitud y sus estados permanecen en Supabase. Repetir la confirmación retorna el mismo evento y contrato.

Si la disponibilidad cambió, no se crea la reserva ni el contrato. El comprobante permanece pendiente para revisión. Este flujo inicial no aprueba automáticamente sobrecupos.

## Evidencia comprobada en Supabase

- Cliente sintético: `DEMO entregable 0e031fb8`.
- Solicitud: `8b8b2a41-a2a5-4307-a693-ed28cc26b5ea`.
- Total S/ 1050, adelanto S/ 105, saldo S/ 945.
- Evento: `8ce6ac12-0c2b-4992-a627-df766ba3fb6b`.
- Contrato: `CTR-3DE5E24B27A04BCAB494`.
- Un evento, un contrato, dos reservas activas de inventario y una entrada de auditoría. El comprobante dice DEMO y no representa un pago real.

## Alcance del entregable

Es un proceso completo de registro y confirmación manual de una reserva hasta emitir su contrato, con interfaz navegable y automatización del cálculo, disponibilidad, reserva, persistencia y documento.

- El formulario reemplaza la captura del chatbot. WhatsApp/Chatwoot y el envío automático al cliente están pendientes.
- La revisión del dinero es responsabilidad del encargado; no hay conciliación bancaria automática.
- El contrato queda emitido y pendiente de firma. No se simulan firma, OTP ni sello PAdES, y el evento no pasa a agendado por una firma inexistente.
- La movilidad se exonera cuando el cliente provee transporte; Google Maps queda fuera de este flujo.
- Se reserva la fecha del evento y el inventario requerido; la asignación específica de un elenco es posterior.
- Documentos nuevos se guardan de forma privada y compartida en PostgreSQL/Supabase, dentro de `booking_documents`. Los documentos anteriores siguen requiriendo su carpeta local hasta una migración operativa coordinada.
- Los precios se congelan al registrar la cotización; duración y recursos del paquete se consultan nuevamente al confirmar.

## Verificaciones

```powershell
npm run lint
npm run build
..\..\eventpro\.venv\Scripts\python.exe scripts\verify-supabase.py
node scripts\verify-ui.mjs
```

El primer comprobador verifica login, catálogo y solicitudes sin crear documentos ni reservas. La generación y recuperación del presupuesto persistido se verifica con las pruebas aisladas del backend o al elegir expresamente la opción de demo. El segundo requiere Playwright y Chrome/Edge; verifica login, formulario, descargas, modal, vista móvil y cierre de sesión sin registrar pagos.

`verify-supabase.py --create-demo-booking` crea y conserva una solicitud sintética completa; úsalo únicamente para una demostración explícita. `verify-persisted-booking.py` comprueba sus estados e inventario con consultas de solo lectura. Los artefactos quedan en `demo-artifacts/`, ignorado por Git.

Para la base aislada anterior usa `scripts/start-demo.ps1 -LocalDatabase` y [DEMO.md](DEMO.md). `verify-demo.py` se bloquea si detecta una base distinta del contenedor local `db`. Los tests de integración nunca deben apuntar a Supabase compartido.


## Cambios tras la auditoría del backend #22

- El despliegue requiere Alembic `0003_manual_booking_documents`, revisado y aplicado por el equipo. El script de arranque no migra la base compartida automáticamente.
- Un segundo encargado verifica el pago. Si el superadministrador registró el comprobante, debe escribir un motivo para autorizar una excepción de verificación propia; queda auditado.
- Si falta capacidad, el comprobante se conserva en revisión. El panel permite aprobar un sobrecupo coordinado o solicitar devolución, sin simular stock ni transferir dinero.
- Registrar devolución realizada exige confirmar que se efectuó el pago al cliente y guardar la referencia.
- Movilidad puede ser exonerada por transporte del cliente o registrada con tarifa manual y motivo. El adelanto usa la configuración del backend, únicamente sobre servicios.
- Solicitudes tienen navegación por páginas. Un reintento de registro no duplica pago; una confirmación repetida conserva evento y contrato.
- El arreglo previo de escritura de catálogo se revisa en una rama y PR separados del proceso manual.
