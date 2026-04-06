import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { jsonError, safeErrorMessage } from '@/lib/api-utils'

export const DELETE = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const postId = String(ctx.params?.postId || '')
    const commentId = String(ctx.params?.commentId || '')
    if (!postId || !commentId) return jsonError('Invalid params', 400, 'VALIDATION_ERROR')

    const userId = ctx.user.userId
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    })
    if (!comment || comment.postId !== postId) return jsonError('Not found', 404, 'NOT_FOUND')
    if (comment.authorId !== userId) return jsonError('Forbidden', 403, 'FORBIDDEN')

    await prisma.comment.delete({ where: { id: commentId } })
    return new Response(null, { status: 204 })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

