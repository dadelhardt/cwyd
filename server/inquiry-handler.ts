import type {
  InquiryChartSlice,
  InquiryResponse,
  InquiryTable,
} from '../src/types/inquiry.ts'
import {
  getSimDatasets,
  suppliersWithMultipleServices,
  type SupplyOnService,
} from './sim-data.ts'

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): InquiryChartSlice[] {
  const map = new Map<string, number>()
  for (const item of items) {
    const key = keyFn(item)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

function tableFromSlices(
  title: string,
  slices: InquiryChartSlice[],
  limit = 10,
): InquiryTable {
  return {
    columns: [title, 'Count'],
    rows: slices.slice(0, limit).map((s) => [s.label, String(s.value)]),
  }
}

function rolloutBySupplier(): InquiryResponse {
  const { slm } = getSimDatasets()
  const bySupplier = countBy(slm, (r) => r.supplierName)
  const slices = bySupplier.slice(0, 8)
  return {
    reply:
      'Rollout-related SLM links by supplier (top 8 by row count in simulated Supplier Connect data).',
    visualization: 'bar',
    chart: slices,
    table: tableFromSlices('Supplier', bySupplier),
  }
}

function serviceMix(): InquiryResponse {
  const { slm } = getSimDatasets()
  const slices = countBy(slm, (r) => r.supplyOnService)
  return {
    reply: 'SupplyOn service mix across simulated SLM records (SCC, DCM, SRC).',
    visualization: 'donut',
    chart: slices,
    table: tableFromSlices('Service', slices),
  }
}

function poStatusBreakdown(): InquiryResponse {
  const { scc } = getSimDatasets()
  const slices = countBy(scc, (r) => r.poStatus)
  return {
    reply: 'Purchase order status breakdown in simulated SCC data.',
    visualization: 'donut',
    chart: slices,
    table: tableFromSlices('PO status', slices),
  }
}

function capacityAlerts(): InquiryResponse {
  const { dcm } = getSimDatasets()
  return {
    reply: `Simulated DCM dataset contains ${dcm.length} capacity alert records.`,
    visualization: 'table',
    table: {
      columns: ['Metric', 'Value'],
      rows: [
        ['Total alerts', String(dcm.length)],
        ['Unique suppliers', String(new Set(dcm.map((r) => r.supplierId)).size)],
        ['Unique customers', String(new Set(dcm.map((r) => r.customerId)).size)],
      ],
    },
  }
}

function rfqStatus(): InquiryResponse {
  const { src } = getSimDatasets()
  const slices = countBy(src, (r) => r.rfqStatus)
  return {
    reply: 'RFQ status distribution in simulated SRC data.',
    visualization: 'bar',
    chart: slices,
    table: tableFromSlices('RFQ status', slices),
  }
}

function filterByService(service: SupplyOnService): InquiryResponse {
  const { slm } = getSimDatasets()
  const filtered = slm.filter((r) => r.supplyOnService === service)
  const sample = filtered.slice(0, 8)
  return {
    reply: `Sample of simulated SLM rows where SupplyOn service is ${service}.`,
    visualization: 'table',
    table: {
      columns: [
        'Customer',
        'Customer ID',
        'Supplier',
        'Supplier ID',
        'Service',
      ],
      rows: sample.map((r) => [
        r.customerName,
        r.customerId,
        r.supplierName,
        r.supplierId,
        r.supplyOnService,
      ]),
    },
  }
}

function multiServiceSuppliers(): InquiryResponse {
  const suppliers = suppliersWithMultipleServices().slice(0, 12)
  return {
    reply:
      'Suppliers with more than one SupplyOn service in SLM (same supplier ID can appear in SCC, DCM, and/or SRC fact data).',
    visualization: 'table',
    table: {
      columns: ['Supplier ID', 'Supplier name', 'Services'],
      rows: suppliers.map((s) => [
        s.supplierId,
        s.supplierName,
        s.services.join(', '),
      ]),
    },
  }
}

function helpResponse(): InquiryResponse {
  return {
    reply:
      'Prototype inquiry engine (no LLM). Try: "rollout by supplier", "multi service suppliers", "service mix", "purchase order status", "capacity alerts", "rfq status", or "SCC suppliers".',
    visualization: 'table',
    table: {
      columns: ['Topic', 'Example prompt'],
      rows: [
        ['Rollout / suppliers', 'rollout status by supplier'],
        ['Multi-service suppliers', 'suppliers using multiple services'],
        ['Service mix', 'SCC DCM SRC mix'],
        ['SCC', 'purchase order status'],
        ['DCM', 'capacity alerts'],
        ['SRC', 'rfq status'],
      ],
    },
  }
}

export function answerInquiry(message: string): InquiryResponse {
  const q = message.trim().toLowerCase()
  if (!q) {
    return { reply: 'Enter a question about rollout, SCC, DCM, or SRC data.' }
  }

  if (q.includes('help') || q === '?') {
    return helpResponse()
  }

  if (
    q.includes('multi service') ||
    q.includes('multiple service') ||
    q.includes('same supplier')
  ) {
    return multiServiceSuppliers()
  }

  if (
    q.includes('rollout') ||
    q.includes('by supplier') ||
    q.includes('supplier status')
  ) {
    return rolloutBySupplier()
  }

  if (q.includes('purchase order') || q.includes('po status') || q.includes('po ')) {
    return poStatusBreakdown()
  }

  if (q.includes('only scc') || q === 'scc') {
    return filterByService('SCC')
  }
  if (q.includes('only dcm') || q === 'dcm') {
    return filterByService('DCM')
  }
  if (q.includes('only src') || q === 'src') {
    return filterByService('SRC')
  }

  if (
    q.includes('service mix') ||
    (q.includes('scc') && q.includes('dcm')) ||
    q.includes('regional') ||
    q.includes('transactional usage')
  ) {
    return serviceMix()
  }

  if (q.includes('capacity') || q.includes('dcm') || q.includes('alert')) {
    return capacityAlerts()
  }

  if (q.includes('rfq') || q.includes('src')) {
    return rfqStatus()
  }

  return {
    reply:
      'No matching prototype query. Say "help" for example prompts. A real LLM and MCP orchestration are not wired yet.',
  }
}
