import { useCallback, useRef, useState, type DragEvent } from 'react'
import type { InquiryResponse } from '@/types/inquiry'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

type Props = {
  onResult: (result: InquiryResponse) => void
}

export default function ChatPanel({ onResult }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Prototype chat with your data. Try "help" or "rollout by supplier". Attachments are shown but not processed yet.',
    },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [attachmentNote, setAttachmentNote] = useState<string | null>(null)
  const idRef = useRef(1)

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || pending) {
      return
    }
    const userId = `u-${idRef.current++}`
    setMessages((m) => [...m, { id: userId, role: 'user', text }])
    setInput('')
    setPending(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = (await res.json()) as InquiryResponse
      setMessages((m) => [
        ...m,
        {
          id: `a-${idRef.current++}`,
          role: 'assistant',
          text: data.reply,
        },
      ])
      onResult(data)
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${idRef.current++}`,
          role: 'assistant',
          text: 'Could not reach the inquiry API. Is the dev server running?',
        },
      ])
    } finally {
      setPending(false)
    }
  }, [input, pending, onResult])

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const names = [...event.dataTransfer.files].map((f) => f.name)
    if (names.length > 0) {
      setAttachmentNote(
        `Received ${names.length} file(s): ${names.join(', ')} (not processed in prototype).`,
      )
    }
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="font-semibold">Chat</h2>
        <p className="text-xs text-zinc-500">Prompt your data</p>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === 'user'
                ? 'ml-6 rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-zinc-900'
                : 'mr-4 rounded-lg bg-zinc-200/80 px-3 py-2 text-sm dark:bg-zinc-800'
            }
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
        {attachmentNote && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {attachmentNote}
          </p>
        )}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`rounded-lg border border-dashed px-3 py-2 text-xs text-zinc-500 ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-zinc-300 dark:border-zinc-700'
          }`}
        >
          Drop files here (prototype only)
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
          rows={3}
          placeholder="Ask about suppliers, POs, alerts, RFQs…"
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={pending || !input.trim()}
          className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </aside>
  )
}
