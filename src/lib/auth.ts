import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export type AuthUser = { userId: string; email: string }

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

function getCookieName() {
  return process.env.COOKIE_NAME ?? 'app_token'
}

export async function signJwt(payload: { sub: string; email: string }) {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'

  return await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret())
}

export async function verifyJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] })
    return payload
  } catch {
    return null
  }
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: getCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: getCookieName(),
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(getCookieName())?.value
  if (!token) return null

  const payload = await verifyJwt(token)
  if (!payload?.sub || typeof payload.sub !== 'string') return null
  if (!payload.email || typeof payload.email !== 'string') return null

  return { userId: payload.sub, email: payload.email }
}

/** Next.js 15+ may pass `params` as a Promise; normalize to a plain object for handlers. */
async function resolveRouteParams(
  raw: Promise<Record<string, string | string[]>> | Record<string, string | string[]> | undefined,
): Promise<Record<string, string | string[]>> {
  if (raw === undefined) return {}
  return await raw
}

export type WithAuthContext = {
  params: Record<string, string | string[]>
  user: AuthUser
}

export function withAuth(
  handler: (req: NextRequest, ctx: WithAuthContext) => Promise<Response>,
) {
  return async (
    req: NextRequest,
    ctx: { params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]> },
  ) => {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    const params = await resolveRouteParams(ctx.params)
    return handler(req, { params, user })
  }
}

