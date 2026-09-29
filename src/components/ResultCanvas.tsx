import type { InquiryResponse } from '@/types/inquiry'

type Props = {
  result: InquiryResponse | null
}

const CHART_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0891b2',
  '#ca8a04',
  '#64748b',
]

function DataTable({ columns, rows }: NonNullable<InquiryResponse['table']>) {
  return (
    <div className="overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-zinc-100 dark:border-zinc-800"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BarChart({ chart }: { chart: NonNullable<InquiryResponse['chart']> }) {
  const max = Math.max(...chart.map((c) => c.value), 1)
  return (
    <div className="flex flex-col gap-2">
      {chart.map((slice, i) => (
        <div key={slice.label} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-2 text-sm">
          <span className="truncate text-zinc-600 dark:text-zinc-400">
            {slice.label}
          </span>
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${(slice.value / max) * 100}%`,
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
          </div>
          <span className="text-right tabular-nums">{slice.value}</span>
        </div>
      ))}
    </div>
  )
}

function buildConicStops(
  chart: NonNullable<InquiryResponse['chart']>,
  total: number,
): string[] {
  const stops: string[] = []
  let running = 0
  for (let i = 0; i < chart.length; i++) {
    const slice = chart[i]!
    const start = (running / total) * 100
    running += slice.value
    const end = (running / total) * 100
    stops.push(
      `${CHART_COLORS[i % CHART_COLORS.length]} ${start}% ${end}%`,
    )
  }
  return stops
}

function DonutChart({ chart }: { chart: NonNullable<InquiryResponse['chart']> }) {
  const total = chart.reduce((sum, c) => sum + c.value, 0) || 1
  const stops = buildConicStops(chart, total)
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div
        className="h-40 w-40 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        aria-hidden
      />
      <ul className="space-y-1 text-sm">
        {chart.map((slice, i) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span>
              {slice.label}: {slice.value} (
              {Math.round((slice.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ResultCanvas({ result }: Props) {
  if (!result) {
    return (
      <div className="flex h-full flex-col justify-center rounded-xl border border-dashed border-zinc-300 p-8 dark:border-zinc-700">
        <h2 className="text-xl font-semibold">Canvas</h2>
        <p className="mt-2 max-w-lg text-zinc-600 dark:text-zinc-400">
          Ask about rollout status, purchase orders, capacity alerts, or RFQs in
          the chat panel. Matching prototype queries show a table or chart here.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          Simulated data in <code className="font-mono">data/sim/</code> (1,000
          rows each for SLM, SCC, DCM, SRC).
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold">Result</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {result.reply}
        </p>
      </div>
      {result.visualization === 'bar' && result.chart && (
        <BarChart chart={result.chart} />
      )}
      {result.visualization === 'donut' && result.chart && (
        <DonutChart chart={result.chart} />
      )}
      {result.table && <DataTable {...result.table} />}
    </div>
  )
}
