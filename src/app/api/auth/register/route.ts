import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { getClientIp, jsonData, jsonError, rateLimitFixedWindow, safeErrorMessage } from '@/lib/api-utils'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rl = await rateLimitFixedWindow({
      key: `rl:register:ip:${ip}`,
      limit: 5,
      windowSeconds: 60 * 60,
    })
    if (!rl.allowed) {
      const headers = new Headers()
      headers.set('Retry-After', String(rl.retryAfterSeconds))
      return jsonError('Too many registrations. Try again later.', 429, 'RATE_LIMITED', headers)
    }

    const json = await req.json().catch(() => null)
    const parsed = registerSchema.safeParse(json)
    if (!parsed.success) {
      return jsonError('Invalid input', 400, 'VALIDATION_ERROR')
    }

    const { firstName, lastName, email, password } = parsed.data

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existing) {
      return jsonError('Email already in use', 409, 'EMAIL_EXISTS')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: passwordHash },
      select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, createdAt: true },
    })

    const token = await signJwt({ sub: user.id, email: user.email })
    const res = NextResponse.json(
      { data: { ...user, createdAt: user.createdAt.toISOString() } },
      { headers: { 'Content-Type': 'application/json' } },
    )
    setAuthCookie(res, token)
    return res
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
}

