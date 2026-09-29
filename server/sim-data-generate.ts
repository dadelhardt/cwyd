import { createSeededRandom, pick } from './random.ts'
import type {
  SccRecord,
  SimDatasets,
  SlmRecord,
  SrcRecord,
  SupplyOnService,
} from './sim-data-types.ts'

const ROWS = 1000
const CUSTOMER_COUNT = 40
const SUPPLIER_COUNT = 120

type Customer = { id: string; name: string }
type SupplierProfile = { id: string; name: string; services: SupplyOnService[] }

function buildCustomers(): Customer[] {
  return Array.from({ length: CUSTOMER_COUNT }, (_, i) => ({
    id: `CUST-${String(i + 1).padStart(4, '0')}`,
    name: `Customer ${i + 1}`,
  }))
}

function servicesForSupplier(index: number): SupplyOnService[] {
  if (index < 30) {
    return ['SCC', 'DCM', 'SRC']
  }
  if (index < 70) {
    const pairs: SupplyOnService[][] = [
      ['SCC', 'DCM'],
      ['SCC', 'SRC'],
      ['DCM', 'SRC'],
    ]
    return pairs[index % pairs.length]!
  }
  const single: SupplyOnService[] = ['SCC', 'DCM', 'SRC']
  return [single[index % single.length]!]
}

function buildSupplierProfiles(): SupplierProfile[] {
  return Array.from({ length: SUPPLIER_COUNT }, (_, i) => ({
    id: `SUP-${String(i + 1).padStart(4, '0')}`,
    name: `Supplier ${i + 1}`,
    services: servicesForSupplier(i),
  }))
}

function pickCustomerForSupplier(
  random: () => number,
  customers: Customer[],
  customersBySupplier: Map<string, string[]>,
  supplierId: string,
): Customer {
  const linkedIds = customersBySupplier.get(supplierId)
  if (linkedIds && linkedIds.length > 0) {
    const id = pick(random, linkedIds)
    return customers.find((c) => c.id === id) ?? pick(random, customers)
  }
  return pick(random, customers)
}

function buildServiceFactRows<T>(
  random: () => number,
  service: SupplyOnService,
  profiles: SupplierProfile[],
  customers: Customer[],
  customersBySupplier: Map<string, string[]>,
  rowCount: number,
  createRow: (
    index: number,
    customerId: string,
    supplierId: string,
  ) => T,
): T[] {
  const eligible = profiles.filter((p) => p.services.includes(service))
  return Array.from({ length: rowCount }, (_, i) => {
    const supplier = pick(random, eligible)
    const customer = pickCustomerForSupplier(
      random,
      customers,
      customersBySupplier,
      supplier.id,
    )
    return createRow(i, customer.id, supplier.id)
  })
}

export function generateSimDatasets(seed = 42): SimDatasets {
  const random = createSeededRandom(seed)
  const customers = buildCustomers()
  const profiles = buildSupplierProfiles()
  const poStatuses: SccRecord['poStatus'][] = ['New', 'Confirmed']
  const rfqStatuses: SrcRecord['rfqStatus'][] = ['new', 'closed']

  const slm: SlmRecord[] = Array.from({ length: ROWS }, () => {
    const supplier = pick(random, profiles)
    const customer = pick(random, customers)
    const supplyOnService = pick(random, supplier.services)
    return {
      customerName: customer.name,
      customerId: customer.id,
      supplierName: supplier.name,
      supplierId: supplier.id,
      supplyOnService,
    }
  })

  const customersBySupplier = new Map<string, string[]>()
  for (const row of slm) {
    const list = customersBySupplier.get(row.supplierId) ?? []
    if (!list.includes(row.customerId)) {
      list.push(row.customerId)
    }
    customersBySupplier.set(row.supplierId, list)
  }

  const scc = buildServiceFactRows(
    random,
    'SCC',
    profiles,
    customers,
    customersBySupplier,
    ROWS,
    (i, customerId, supplierId) => ({
      customerId,
      supplierId,
      purchaseOrderNr: `PO-${String(i + 1).padStart(6, '0')}`,
      purchaseOrderDescription: `Purchase order ${i + 1}`,
      poStatus: pick(random, poStatuses),
    }),
  )

  const dcm = buildServiceFactRows(
    random,
    'DCM',
    profiles,
    customers,
    customersBySupplier,
    ROWS,
    (i, customerId, supplierId) => ({
      customerId,
      supplierId,
      capacityAlertNr: `CA-${String(i + 1).padStart(6, '0')}`,
      capacityAlertDetails: `Capacity alert ${i + 1}`,
    }),
  )

  const src = buildServiceFactRows(
    random,
    'SRC',
    profiles,
    customers,
    customersBySupplier,
    ROWS,
    (i, customerId, supplierId) => ({
      customerId,
      supplierId,
      rfqNr: `RFQ-${String(i + 1).padStart(6, '0')}`,
      rfqDetails: `RFQ ${i + 1}`,
      rfqStatus: pick(random, rfqStatuses),
    }),
  )

  return { slm, scc, dcm, src }
}
