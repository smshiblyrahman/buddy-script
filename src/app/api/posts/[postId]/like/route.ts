import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { paginationSchema } from '@/lib/validations'
import { jsonData, jsonError, safeErrorMessage } from '@/lib/api-utils'
import { redisDecr, redisIncr, redisSet } from '@/lib/redis'

export const POST = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const postId = String(ctx.params?.postId || '')
    if (!postId) return jsonError('Invalid postId', 400, 'VALIDATION_ERROR')

    const userId = ctx.user.userId
    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { userId: true },
    })

    let liked: boolean
    if (existing) {
      await prisma.postLike.delete({ where: { userId_postId: { userId, postId } } })
      liked = false
      await redisDecr(`likes:post:${postId}`)
    } else {
      await prisma.postLike.create({ data: { userId, postId } })
      liked = true
      await redisIncr(`likes:post:${postId}`)
    }

    const count = await prisma.postLike.count({ where: { postId } })
    await redisSet(`likes:post:${postId}`, String(count), { ex: 300 })

    return jsonData({ liked, count }, { status: 200 })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

export const GET = withAuth(async (req: NextRequest, ctx) => {
  try {
    const postId = String(ctx.params?.postId || '')
    if (!postId) return jsonError('Invalid postId', 400, 'VALIDATION_ERROR')

    const url = new URL(req.url)
    const parsed = paginationSchema.safeParse({
      cursor: url.searchParams.get('cursor') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })
    if (!parsed.success) return jsonError('Invalid pagination', 400, 'VALIDATION_ERROR')
    const { cursor, limit } = parsed.data

    const likes = await prisma.postLike.findMany({
      where: { postId },
      take: limit + 1,
      ...(cursor ? { cursor: { userId_postId: { userId: cursor, postId } }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    })

    const hasMore = likes.length > limit
    const items = hasMore ? likes.slice(0, limit) : likes
    const nextCursor = hasMore ? items[items.length - 1]!.user.id : null

    return jsonData(items.map((l) => l.user), { status: 200, nextCursor })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

