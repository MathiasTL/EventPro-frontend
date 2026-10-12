"""Verifica contratos E2E de la demo; crea registros sintéticos y los da de baja."""
import json
import os
import subprocess
import urllib.error
import urllib.request
from uuid import uuid4

BASE = os.environ.get("EVENTPRO_API_URL", "http://localhost:8000/api/v1")
token = ""

# Este comprobador modifica datos; nunca debe ejecutarse contra la base compartida.
subprocess.run([
    "docker", "exec", "eventpro_api", "python", "-c",
    "from urllib.parse import urlparse; from app.core.config import get_settings; "
    "assert urlparse(get_settings().database_url).hostname == 'db', "
    "'Este comprobador solo permite la base Docker local. Usa verify-supabase.py.'",
], check=True)


def request(path, method="GET", body=None):
    headers = {"Content-Type": "application/json", "Origin": "http://localhost:3002"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as response:
        assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:3002"
        return json.load(response)


session = request("/auth/login", "POST", {"email": "admin@eventpro.pe", "password": os.environ.get("EVENTPRO_DEMO_PASSWORD", "Eventpro2026!")})
token = session["access_token"]
assert session["user"]["role"] == "SUPERADMIN"
suffix = str(uuid4())[:8]
theme = request("/catalog/themes", "POST", {"name": "Verificación " + suffix, "description": "Datos sintéticos"})
package_body = {"name": "Verificación " + suffix, "service_category": "SHOW", "base_price": 1000, "direct_cost": 450, "duration_minutes": 60}
package = request("/catalog/packages", "POST", package_body)
inventory = request("/catalog/inventory-items", "POST", {"name": "Verificación " + suffix, "service_category": "TENTS", "total_stock": 10})
extra = request("/catalog/extras", "POST", {"name": "Verificación " + suffix, "sale_price": 150, "direct_cost": 50})
crew = request("/crews", "POST", {"leader_name": "Verificación " + suffix, "phone": "+51900000000", "service_category": "SHOW"})
request(f"/catalog/packages/{package['id']}/themes", "PUT", {"theme_ids": [theme["id"]]})
request(f"/catalog/packages/{package['id']}/inventory-items", "PUT", {"items": [{"inventory_item_id": inventory["id"], "quantity": 1}]})
linked = request(f"/catalog/packages/{package['id']}")
assert linked["compatible_themes"][0]["id"] == theme["id"]
assert linked["inventory_items"][0]["quantity"] == 1
package_body["base_price"] = 1100
request(f"/catalog/packages/{package['id']}", "PATCH", package_body)
request(f"/crews/{crew['id']}", "PATCH", {"is_active": False})
patched = request(f"/crews/{crew['id']}", "PATCH", {"phone": "+51900000001"})
assert patched["is_active"] is False
pending = request("/payments?validation_status=REQUIRES_MANUAL_APPROVAL")
if pending["items"]:
    payment = pending["items"][0]
    try:
        request(f"/overrides/payments/{payment['payment_id']}/approve-simultaneous", "POST", {"action": "APPROVE", "event_id": str(uuid4())})
        raise AssertionError("Un evento inexistente fue aceptado")
    except urllib.error.HTTPError as error:
        assert error.code == 404
    assert request(f"/payments/{payment['payment_id']}")["validation_status"] == "REQUIRES_MANUAL_APPROVAL"
request(f"/catalog/packages/{package['id']}/inventory-items", "PUT", {"items": []})
for kind, row in [("packages", package), ("themes", theme), ("extras", extra), ("inventory-items", inventory)]:
    assert request(f"/catalog/{kind}/{row['id']}", "DELETE")["is_active"] is False
print("OK: login, CORS, catálogo, vínculos, elencos y rechazo de evento inexistente.")

# Solo la base local de demo: conservamos el pago del guion sin resolver.
approval_id, rejection_id = str(uuid4()), str(uuid4())


def demo_sql(sql):
    subprocess.run([
        "docker", "exec", "-i", "eventpro_db", "sh", "-c",
        'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"',
    ], input=sql, text=True, check=True, stdout=subprocess.DEVNULL)


try:
    for payment_id in (approval_id, rejection_id):
        demo_sql(f"INSERT INTO payments (id, quote_id, concept, payment_method, amount, evidence_path, validation_status) VALUES ('{payment_id}', 'eeeeeeee-0000-4000-8000-000000000002', 'ADVANCE', 'YAPE', 100, 'demo/verification', 'REQUIRES_MANUAL_APPROVAL');")
    event_id = "eeeeeeee-0000-4000-8000-000000000003"
    request(f"/overrides/payments/{approval_id}/approve-simultaneous", "POST", {"action": "APPROVE", "event_id": event_id})
    approved = request(f"/payments/{approval_id}")
    assert approved["validation_status"] == "VERIFIED"
    assert approved["event_id"] == event_id
    request(f"/overrides/payments/{rejection_id}/approve-simultaneous", "POST", {"action": "REJECT"})
    assert request(f"/payments/{rejection_id}")["validation_status"] == "REFUND_PENDING"
    print("OK: aprobación VERIFIED y rechazo REFUND_PENDING persistentes.")
finally:
    demo_sql(f"DELETE FROM payments WHERE id IN ('{approval_id}', '{rejection_id}');")
