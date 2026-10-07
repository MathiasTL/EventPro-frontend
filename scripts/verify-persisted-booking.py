"""Solo lectura: comprobar en Supabase la solicitud DEMO creada por verify-supabase."""

import asyncio
import json
import os
from pathlib import Path
import sys
from uuid import UUID

frontend = Path(__file__).resolve().parents[1]
backend = frontend.parent.parent / "eventpro"
booking = json.loads((frontend / "demo-artifacts" / "booking.json").read_text(encoding="utf-8"))
sys.path.insert(0, str(backend))
os.chdir(backend)

from sqlalchemy import text
from app.infrastructure.adapters.secondary.persistence.database import build_engine


async def verify():
    engine = build_engine()
    try:
        async with engine.connect() as connection:
            row = (await connection.execute(text("""
                SELECT q.status AS quote_status, p.validation_status, e.status AS event_status,
                  co.status AS contract_status, co.is_manual_mode,
                  (SELECT count(*) FROM events WHERE quote_id=q.id) AS event_count,
                  (SELECT count(*) FROM contracts WHERE event_id=e.id) AS contract_count,
                  (SELECT count(*) FROM inventory_reservations WHERE event_id=e.id AND status='ACTIVE') AS reservations,
                  (SELECT count(*) FROM package_inventory_items WHERE package_id=q.package_id) AS requirements,
                  (SELECT count(*) FROM audit_logs WHERE entity_id=co.id AND action='MANUAL_CONTRACT') AS audits
                FROM quotes q JOIN payments p ON p.quote_id=q.id
                JOIN events e ON e.quote_id=q.id JOIN contracts co ON co.event_id=e.id
                WHERE q.id=:id
            """), {"id": UUID(booking["quote_id"])})).mappings().one()
            assert row["quote_status"] == "CONVERTED"
            assert row["validation_status"] == "VERIFIED"
            assert row["event_status"] == "AWAITING_SIGNATURE"
            assert row["contract_status"] == "ISSUED" and row["is_manual_mode"]
            assert row["event_count"] == row["contract_count"] == row["audits"] == 1
            assert row["reservations"] == row["requirements"] and row["requirements"] > 0
            print("OK Supabase: 1 evento, 1 contrato, 1 auditoría y " + str(row["reservations"]) + " reservas de inventario activas.")
            print("Estados: CONVERTED / VERIFIED / AWAITING_SIGNATURE / ISSUED.")
    finally:
        await engine.dispose()


asyncio.run(verify())
