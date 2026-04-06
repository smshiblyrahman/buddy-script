import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { redisGet, redisIncr, redisExpire, redisTtl } from '@/lib/redis'

export function jsonData<T>(data: T, init?: ResponseInit & { nextCursor?: string | null }) {
  const body: unknown =
    typeof init?.nextCursor === 'undefined' ? { data } : { data, nextCursor: init.nextCursor }

  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')

  return NextResponse.json(body, { ...init, headers })
}

export function jsonError(
  error: string,
  status: number,
  code?: string,
  headers?: HeadersInit,
) {
  const outHeaders = new Headers(headers)
  outHeaders.set('Content-Type', 'application/json')
  return NextResponse.json({ error, ...(code ? { code } : {}) }, { status, headers: outHeaders })
}

export function safeErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message
  return 'Unknown error'
}

export function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function rateLimitFixedWindow(opts: {
  key: string
  limit: number
  windowSeconds: number
}) {
  const count = await redisIncr(opts.key)
  if (count === null) {
    return { allowed: true, count: 0, retryAfterSeconds: 0 }
  }
  if (count === 1) {
    await redisExpire(opts.key, opts.windowSeconds)
  }
  const ttl = (await redisTtl(opts.key)) ?? 0
  return { allowed: count <= opts.limit, count, retryAfterSeconds: Math.max(0, ttl) }
}
