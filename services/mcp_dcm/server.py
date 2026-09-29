from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services"))

from mcp.server.fastmcp import FastMCP

from mcp_shared.data import load_dataset
from mcp_shared.response import tool_payload

mcp = FastMCP("cwyd-dcm")


@mcp.tool()
def dcm_schema() -> str:
    """Describe DCM capacity alert columns."""
    return (
        "DCM dataset: customerId, supplierId, capacityAlertNr, capacityAlertDetails."
    )


@mcp.tool()
def dcm_alert_summary() -> str:
    """Summary counts for DCM capacity alerts."""
    rows = load_dataset("dcm")
    suppliers = {str(r["supplierId"]) for r in rows}
    customers = {str(r["customerId"]) for r in rows}
    table = {
        "columns": ["Metric", "Value"],
        "rows": [
            ["Total alerts", str(len(rows))],
            ["Unique suppliers", str(len(suppliers))],
            ["Unique customers", str(len(customers))],
        ],
    }
    return tool_payload(
        "DCM capacity alert volume summary.",
        visualization="table",
        table=table,
    )


@mcp.tool()
def dcm_alerts_for_supplier(supplier_id: str, limit: int = 10) -> str:
    """Sample capacity alerts for a supplier ID."""
    rows = load_dataset("dcm")
    filtered = [r for r in rows if str(r["supplierId"]) == supplier_id][:limit]
    table = {
        "columns": ["Alert", "Customer", "Details"],
        "rows": [
            [
                str(r["capacityAlertNr"]),
                str(r["customerId"]),
                str(r["capacityAlertDetails"]),
            ]
            for r in filtered
        ],
    }
    return tool_payload(
        f"Sample DCM alerts for supplier {supplier_id}.",
        visualization="table",
        table=table,
    )


if __name__ == "__main__":
    mcp.run()
