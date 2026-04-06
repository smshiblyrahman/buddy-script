import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { jsonData, jsonError, safeErrorMessage } from '@/lib/api-utils'
import { redisIncr } from '@/lib/redis'

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const postId = String(ctx.params?.postId || '')
    if (!postId) return jsonError('Invalid postId', 400, 'VALIDATION_ERROR')

    const userId = ctx.user.userId

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'PRIVATE', authorId: userId }],
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
        likes: { where: { userId }, select: { userId: true } },
      },
    })

    if (!post) return jsonError('Not found', 404, 'NOT_FOUND')

    return jsonData(
      {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        likedByMe: post.likes.length > 0,
      },
      { status: 200 },
    )
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

export const DELETE = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const postId = String(ctx.params?.postId || '')
    if (!postId) return jsonError('Invalid postId', 400, 'VALIDATION_ERROR')

    const userId = ctx.user.userId
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (!post) return jsonError('Not found', 404, 'NOT_FOUND')
    if (post.authorId !== userId) return jsonError('Forbidden', 403, 'FORBIDDEN')

    await prisma.post.delete({ where: { id: postId } })
    await redisIncr('feed:seq')
    return new Response(null, { status: 204 })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

