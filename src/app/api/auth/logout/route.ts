import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ data: true }, { headers: { 'Content-Type': 'application/json' } })
  clearAuthCookie(res)
  return res
}

