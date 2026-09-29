from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services"))

from mcp.server.fastmcp import FastMCP

from mcp_shared.data import count_by, load_dataset
from mcp_shared.response import tool_payload

mcp = FastMCP("cwyd-src")


@mcp.tool()
def src_schema() -> str:
    """Describe SRC RFQ columns."""
    return "SRC dataset: customerId, supplierId, rfqNr, rfqDetails, rfqStatus (new|closed)."


@mcp.tool()
def src_rfq_status_breakdown() -> str:
    """Count RFQs by status."""
    rows = load_dataset("src")
    counts = count_by(rows, "rfqStatus")
    chart = [{"label": k, "value": v} for k, v in counts.items()]
    table = {
        "columns": ["RFQ status", "Count"],
        "rows": [[k, str(v)] for k, v in counts.items()],
    }
    return tool_payload(
        "SRC RFQ counts by status.",
        visualization="bar",
        table=table,
        chart=chart,
    )


@mcp.tool()
def src_rfqs_for_supplier(supplier_id: str, limit: int = 10) -> str:
    """Sample RFQs for a supplier ID."""
    rows = load_dataset("src")
    filtered = [r for r in rows if str(r["supplierId"]) == supplier_id][:limit]
    table = {
        "columns": ["RFQ", "Customer", "Status", "Details"],
        "rows": [
            [
                str(r["rfqNr"]),
                str(r["customerId"]),
                str(r["rfqStatus"]),
                str(r["rfqDetails"]),
            ]
            for r in filtered
        ],
    }
    return tool_payload(
        f"Sample SRC RFQs for supplier {supplier_id}.",
        visualization="table",
        table=table,
    )


if __name__ == "__main__":
    mcp.run()
