export type SupplyOnService = 'SCC' | 'DCM' | 'SRC'

export type SlmRecord = {
  customerName: string
  customerId: string
  supplierName: string
  supplierId: string
  supplyOnService: SupplyOnService
}

export type SccRecord = {
  customerId: string
  supplierId: string
  purchaseOrderNr: string
  purchaseOrderDescription: string
  poStatus: 'New' | 'Confirmed'
}

export type DcmRecord = {
  customerId: string
  supplierId: string
  capacityAlertNr: string
  capacityAlertDetails: string
}

export type SrcRecord = {
  customerId: string
  supplierId: string
  rfqNr: string
  rfqDetails: string
  rfqStatus: 'new' | 'closed'
}

export type SimDatasets = {
  slm: SlmRecord[]
  scc: SccRecord[]
  dcm: DcmRecord[]
  src: SrcRecord[]
}
