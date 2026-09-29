from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services"))

from mcp.server.fastmcp import FastMCP

from mcp_shared.data import count_by, load_dataset
from mcp_shared.response import tool_payload

mcp = FastMCP("cwyd-scc")


@mcp.tool()
def scc_schema() -> str:
    """Describe SCC purchase order columns."""
    return (
        "SCC dataset: customerId, supplierId, purchaseOrderNr, "
        "purchaseOrderDescription, poStatus (New|Confirmed)."
    )


@mcp.tool()
def scc_po_status_breakdown() -> str:
    """Count purchase orders by PO status."""
    rows = load_dataset("scc")
    counts = count_by(rows, "poStatus")
    chart = [{"label": k, "value": v} for k, v in counts.items()]
    table = {
        "columns": ["PO status", "Count"],
        "rows": [[k, str(v)] for k, v in counts.items()],
    }
    return tool_payload(
        "SCC purchase order counts by status.",
        visualization="donut",
        table=table,
        chart=chart,
    )


@mcp.tool()
def scc_pos_for_supplier(supplier_id: str, limit: int = 10) -> str:
    """List sample purchase orders for a supplier ID (e.g. SUP-0009)."""
    rows = load_dataset("scc")
    filtered = [r for r in rows if str(r["supplierId"]) == supplier_id][:limit]
    table = {
        "columns": ["PO", "Customer", "Status", "Description"],
        "rows": [
            [
                str(r["purchaseOrderNr"]),
                str(r["customerId"]),
                str(r["poStatus"]),
                str(r["purchaseOrderDescription"]),
            ]
            for r in filtered
        ],
    }
    return tool_payload(
        f"Sample SCC POs for supplier {supplier_id} ({len(filtered)} rows).",
        visualization="table",
        table=table,
    )


if __name__ == "__main__":
    mcp.run()
