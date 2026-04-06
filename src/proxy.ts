import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwt } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/register', '/design-assets', '/api/auth/login', '/api/auth/register']

function isStaticPublicAsset(pathname: string) {
  // Files under public/ are served at URL root (e.g. public/assets/... → /assets/...).
  // Must not require auth or <img src="/assets/..."> gets a 302 HTML login page instead of bytes.
  if (pathname.startsWith('/assets/') || pathname === '/assets') return true
  if (pathname.startsWith('/uploads/') || pathname === '/uploads') return true
  if (pathname === '/favicon.ico' || pathname === '/robots.txt' || pathname === '/sitemap.xml') return true
  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieName = process.env.COOKIE_NAME ?? 'app_token'

  if (isStaticPublicAsset(pathname)) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(cookieName)?.value
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyJwt(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete(cookieName)
    return response
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.sub as string)
  requestHeaders.set('x-user-email', payload.email as string)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|uploads/).*)'],
}
