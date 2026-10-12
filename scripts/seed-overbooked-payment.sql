-- Datos sintéticos para la demo. Idempotente: no reinicia decisiones ya tomadas.
BEGIN;
INSERT INTO clients (id, phone, full_name)
VALUES ('eeeeeeee-0000-4000-8000-000000000001', '+51900000999', 'Cliente Demo EventPro')
ON CONFLICT (id) DO NOTHING;
INSERT INTO quotes (id, client_id, source, event_date, event_time, location_address,
location_district, package_id, services_subtotal, total_amount, advance_amount,
pending_balance, status, sent_at, expires_at)
SELECT 'eeeeeeee-0000-4000-8000-000000000002', 'eeeeeeee-0000-4000-8000-000000000001',
'MANUAL', CURRENT_DATE + 7, '19:00', 'Local de demostración', 'San Borja', id,
1000, 1000, 100, 900, 'PAYMENT_STARTED', NOW(), NOW() + INTERVAL '7 days'
FROM packages WHERE is_active ORDER BY name LIMIT 1
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, event_code, quote_id, event_date, start_time, end_time,
address, district, total_services_amount, total_mobility_amount, final_total_amount)
SELECT 'eeeeeeee-0000-4000-8000-000000000003', 'EVT-DEMO-OVERCAP', id,
event_date, '19:00', '20:00', location_address, location_district, 1000, 0, 1000
FROM quotes WHERE id = 'eeeeeeee-0000-4000-8000-000000000002'
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, quote_id, concept, payment_method, amount, evidence_path, validation_status)
SELECT 'eeeeeeee-0000-4000-8000-000000000004', id, 'ADVANCE', 'YAPE', 100,
'demo/receipt-placeholder', 'REQUIRES_MANUAL_APPROVAL'
FROM quotes WHERE id = 'eeeeeeee-0000-4000-8000-000000000002'
ON CONFLICT (id) DO NOTHING;
COMMIT;
