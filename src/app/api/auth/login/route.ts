import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { getClientIp, jsonError, rateLimitFixedWindow, safeErrorMessage } from '@/lib/api-utils'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rl = await rateLimitFixedWindow({
      key: `rl:login:ip:${ip}`,
      limit: 10,
      windowSeconds: 60 * 15,
    })
    if (!rl.allowed) {
      const headers = new Headers()
      headers.set('Retry-After', String(rl.retryAfterSeconds))
      return jsonError('Too many attempts. Try again later.', 429, 'RATE_LIMITED', headers)
    }

    const json = await req.json().catch(() => null)
    const parsed = loginSchema.safeParse(json)
    if (!parsed.success) {
      return jsonError('Invalid input', 400, 'VALIDATION_ERROR')
    }

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, createdAt: true, password: true },
    })
    if (!user) {
      return jsonError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return jsonError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    const token = await signJwt({ sub: user.id, email: user.email })
    const res = NextResponse.json(
      {
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    setAuthCookie(res, token)
    return res
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
}

