---
id: REQ-001
title: Health check
status: done
priority: low
---

## Outcome

An operator can confirm the app process is responding.

## Scope

### In

- `GET /api/health` returns HTTP 200 and a JSON body `{ "status": "ok" }`.

### Out

- Authentication, dependency checks, and any other routes.

## Acceptance criteria

1. Given the app is running, when a client sends `GET /api/health`, then the response status is 200 and the body is `{ "status": "ok" }`.

## Interfaces

- `GET /api/health` → `200` `{ "status": "ok" }`

## Data

None.

## Constraints

- The route is served by the Vite dev server and `vite preview`. A static file host does not serve it.

## Open questions

## Verification

- `npm run build` succeeds.
- With `npm run dev` or `npm run preview` running, `GET /api/health` returns `{ "status": "ok" }`.
