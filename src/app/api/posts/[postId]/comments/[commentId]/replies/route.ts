import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { createReplySchema } from '@/lib/validations'
import { jsonData, jsonError, safeErrorMessage } from '@/lib/api-utils'

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const commentId = String(ctx.params?.commentId || '')
    if (!commentId) return jsonError('Invalid commentId', 400, 'VALIDATION_ERROR')

    const json = await req.json().catch(() => null)
    const parsed = createReplySchema.safeParse(json)
    if (!parsed.success) return jsonError('Invalid input', 400, 'VALIDATION_ERROR')

    const reply = await prisma.reply.create({
      data: {
        commentId,
        authorId: ctx.user.userId,
        content: parsed.data.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        commentId: true,
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { likes: true } },
      },
    })

    return jsonData(
      {
        ...reply,
        createdAt: reply.createdAt.toISOString(),
        likedByMe: false,
      },
      { status: 201 },
    )
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const commentId = String(ctx.params?.commentId || '')
    if (!commentId) return jsonError('Invalid commentId', 400, 'VALIDATION_ERROR')

    const userId = ctx.user.userId
    const replies = await prisma.reply.findMany({
      where: { commentId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        content: true,
        createdAt: true,
        commentId: true,
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { likes: true } },
        likes: { where: { userId }, select: { userId: true } },
      },
    })

    return jsonData(
      replies.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        commentId: r.commentId,
        author: r.author,
        _count: { likes: r._count.likes },
        likedByMe: r.likes.length > 0,
      })),
      { status: 200 },
    )
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

