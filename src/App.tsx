import { useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import ResultCanvas from '@/components/ResultCanvas'
import type { InquiryResponse } from '@/types/inquiry'

export default function App() {
  const [result, setResult] = useState<InquiryResponse | null>(null)

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">cwyd</h1>
          <p className="text-xs text-zinc-500">
            Chat with your data — first prototype
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Simulated SLM · SCC · DCM · SRC
        </span>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_22rem]">
        <section className="min-h-0 overflow-auto p-4 lg:p-6">
          <ResultCanvas result={result} />
        </section>
        <ChatPanel onResult={setResult} />
      </div>
    </div>
  )
}
