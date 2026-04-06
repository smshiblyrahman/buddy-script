import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { createPostSchema, paginationSchema } from '@/lib/validations'
import { jsonData, jsonError, rateLimitFixedWindow, safeErrorMessage } from '@/lib/api-utils'
import { redisGet, redisIncr, redisSet } from '@/lib/redis'
import type { Prisma } from '@prisma/client'

import { fetchFeedPosts } from '@/lib/feed'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  try {
    const url = new URL(req.url)
    const parsed = paginationSchema.safeParse({
      cursor: url.searchParams.get('cursor') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })
    if (!parsed.success) return jsonError('Invalid pagination', 400, 'VALIDATION_ERROR')

    const { cursor, limit } = parsed.data
    const userId = ctx.user.userId

    const rl = await rateLimitFixedWindow({
      key: `rl:feed:user:${userId}:${Math.floor(Date.now() / 60000)}`,
      limit: 100,
      windowSeconds: 60,
    })
    if (!rl.allowed) {
      const headers = new Headers()
      headers.set('Retry-After', String(rl.retryAfterSeconds))
      return jsonError('Too many requests', 429, 'RATE_LIMITED', headers)
    }

    const result = await fetchFeedPosts(userId, limit, cursor)
    return jsonData(result.data, { status: 200, nextCursor: result.nextCursor })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const json = await req.json().catch(() => null)
    const parsed = createPostSchema.safeParse(json)
    if (!parsed.success) return jsonError(`Invalid input: ${parsed.error.message}`, 400, 'VALIDATION_ERROR')

    const userId = ctx.user.userId
    const { content, imageUrl, visibility } = parsed.data

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        visibility,
        authorId: userId,
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })

    await redisIncr(`feedver:${userId}`)
    await redisIncr('feed:seq')

    return jsonData(
      {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        likedByMe: false,
      },
      { status: 201 },
    )
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

