export type VisualizationKind = 'table' | 'bar' | 'donut'

export type InquiryTable = {
  columns: string[]
  rows: string[][]
}

export type InquiryChartSlice = {
  label: string
  value: number
}

export type InquiryResponse = {
  reply: string
  visualization?: VisualizationKind
  table?: InquiryTable
  chart?: InquiryChartSlice[]
}

export type InquiryRequest = {
  message: string
}
