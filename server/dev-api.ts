import type { Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { answerInquiry } from './inquiry-handler.ts'
import { forwardInquiryToOrchestrator } from './orchestrator-client.ts'
import {
  getSemanticCatalog,
  getSemanticSummaryForLlm,
} from './semantic/load-catalog.ts'
import type { InquiryRequest } from '../src/types/inquiry.ts'

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) {
    return {}
  }
  return JSON.parse(raw) as unknown
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export function createDevApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const path = req.url?.split('?')[0]

    if (req.method === 'GET' && path === '/api/health') {
      sendJson(res, 200, { status: 'ok' })
      return
    }

    if (req.method === 'GET' && path === '/api/semantic/summary') {
      try {
        const catalog = getSemanticCatalog()
        sendJson(res, 200, {
          version: catalog.version,
          summary: getSemanticSummaryForLlm(),
        })
      } catch (error) {
        sendJson(res, 500, {
          error: error instanceof Error ? error.message : 'Failed to load catalog',
        })
      }
      return
    }

    if (req.method === 'POST' && path === '/api/inquiries') {
      void (async () => {
        try {
          const body = (await readJsonBody(req)) as InquiryRequest
          const message = typeof body.message === 'string' ? body.message : ''
          const orchestrated = await forwardInquiryToOrchestrator(message)
          if (orchestrated) {
            sendJson(res, 200, orchestrated)
            return
          }
          const fallback = answerInquiry(message)
          sendJson(res, 200, {
            ...fallback,
            reply: `${fallback.reply}\n\n(Orchestrator unavailable — start \`npm run orchestrator\` and configure services/.env for Azure AI Foundry or OPENAI_API_KEY.)`,
          })
        } catch {
          sendJson(res, 400, { reply: 'Invalid JSON body. Expected { "message": "..." }.' })
        }
      })()
      return
    }

    next()
  }
}
