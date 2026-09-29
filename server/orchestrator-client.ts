import type { InquiryResponse } from '../src/types/inquiry.ts'

const DEFAULT_URL = 'http://127.0.0.1:8765'

export function getOrchestratorUrl(): string | undefined {
  const explicit = process.env.CWYD_ORCHESTRATOR_URL
  if (explicit === 'off' || explicit === 'false') {
    return undefined
  }
  return explicit ?? DEFAULT_URL
}

export async function forwardInquiryToOrchestrator(
  message: string,
): Promise<InquiryResponse | null> {
  const base = getOrchestratorUrl()
  if (!base) {
    return null
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120_000)
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    })
    if (!res.ok) {
      return null
    }
    return (await res.json()) as InquiryResponse
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
