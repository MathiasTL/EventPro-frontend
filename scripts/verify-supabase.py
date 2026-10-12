"""Comprobación de lectura; --create-demo-booking demuestra el proceso manual.

La opción de demo crea UNA solicitud sintética en la BD compartida y la conserva.
No modifica ni borra registros ajenos. No sustituye los tests de integración locales.
"""

import argparse
import base64
import io
import json
import os
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import urllib.error
import urllib.request
from uuid import uuid4

parser = argparse.ArgumentParser()
parser.add_argument("--create-demo-booking", action="store_true")
args = parser.parse_args()
frontend = Path(__file__).resolve().parents[1]
backend = frontend.parent.parent / "eventpro"
settings = {}
for line in (backend / ".env").read_text(encoding="utf-8-sig").splitlines():
    if "=" in line and not line.lstrip().startswith("#"):
        key, value = line.split("=", 1)
        settings[key] = value.strip()
BASE = os.environ.get("EVENTPRO_API_URL", "http://localhost:8000/api/v1")
token = ""


def request(path, body=None, *, raw=None, content_type=None):
    headers = {"Origin": "http://localhost:3002", "Content-Type": content_type or "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    data = raw if raw is not None else json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:3002"
            return json.load(response)
    except urllib.error.HTTPError as error:
        detail = json.loads(error.read()).get("detail", "Error de API")
        raise RuntimeError(f"{error.code}: {detail}") from None


session = request("/auth/login", {"email": settings.get("SUPERADMIN_EMAIL", "admin@eventpro.pe"), "password": settings["SUPERADMIN_PASSWORD"]})
token = session["access_token"]
packages = request("/catalog/packages")["items"]
assert packages
package = next((item for item in packages if item["inventory_items"]), packages[0])
extras = request("/catalog/extras")["items"]
payload = {
    "client_name": "DEMO entregable " + uuid4().hex[:8],
    "event_date": str(date.today() + timedelta(days=30)),
    "start_time": "16:00", "address": "Local sintético de demostración",
    "package_id": package["id"], "theme_id": None,
    "extra_ids": [extras[0]["id"]] if extras else [], "client_provides_transport": True,
}
assert request("/manual-bookings") is not None
print("OK: login, CORS y lectura del catálogo y solicitudes. No crea documentos ni reservas.")

if args.create_demo_booking:
    budget = request("/budgets/prepare", payload)
    subtotal = Decimal(str(package["base_price"])) + (Decimal(str(extras[0]["sale_price"])) if extras else 0)
    assert Decimal(budget["services_subtotal"]) == subtotal
    assert Decimal(budget["advance_amount"]) == (subtotal * Decimal(settings.get("ADVANCE_PERCENT", "10")) / Decimal(100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    assert base64.b64decode(budget["pdf_base64"]).startswith(b"%PDF")
    assert request("/manual-bookings") is not None
    print("OK: presupuesto persistido, disponibilidad y cálculo financiero.")

    from PIL import Image, ImageDraw

    assert budget["availability_status"] == "AVAILABLE", "Escoge otra fecha de demo disponible"
    quote_id = str(uuid4())
    payload.update({
        "quote_id": quote_id, "phone": "+519" + str(int(uuid4().hex[:8], 16)).zfill(10)[-8:],
        "district": "Demo entregable", "payment_method": "YAPE", "paid_amount": budget["advance_amount"],
    })
    image = Image.new("RGB", (640, 180), "white")
    ImageDraw.Draw(image).text((20, 40), "DEMO EVENTPRO - NO ES UN PAGO REAL", fill="black")
    buffer = io.BytesIO(); image.save(buffer, format="PNG")
    boundary = "EventPro" + uuid4().hex
    multipart = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\n\r\n{json.dumps(payload)}\r\n'
        f'--{boundary}\r\nContent-Disposition: form-data; name="receipt_file"; filename="DEMO.png"\r\nContent-Type: image/png\r\n\r\n'
    ).encode() + buffer.getvalue() + f"\r\n--{boundary}--\r\n".encode()
    booking = request("/manual-bookings", raw=multipart, content_type="multipart/form-data; boundary=" + boundary)
    assert booking["payment_status"] == "PENDING_VERIFICATION" and booking["event_id"] is None
    confirmed = request(f"/manual-bookings/{quote_id}/confirm", {"receipt_verified": True, "override_reason": "Demostración sintética supervisada; no representa un pago real"})
    assert confirmed["payment_status"] == "VERIFIED"
    assert confirmed["quote_status"] == "CONVERTED"
    assert confirmed["event_id"] and confirmed["contract_id"]
    repeated = request(f"/manual-bookings/{quote_id}/confirm", {"receipt_verified": True, "override_reason": "Demostración sintética supervisada; no representa un pago real"})
    assert repeated["event_id"] == confirmed["event_id"]
    assert repeated["contract_id"] == confirmed["contract_id"]
    document = request(f"/manual-bookings/{quote_id}/contract")
    pdf = base64.b64decode(document["pdf_base64"])
    assert pdf.startswith(b"%PDF")
    folder = frontend / "demo-artifacts"; folder.mkdir(exist_ok=True)
    (folder / document["filename"]).write_bytes(pdf)
    (folder / "booking.json").write_text(json.dumps(confirmed, ensure_ascii=False, indent=2), encoding="utf-8")
    print("OK: comprobante → pago VERIFIED → cotización CONVERTED → evento reservado → contrato PDF.")
    print("Referencia de demo: " + quote_id)
    print("Contrato: " + confirmed["contract_number"])
    print("Reintento: mismo evento y contrato, sin duplicados.")
