import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { jsonError, safeErrorMessage } from '@/lib/api-utils'

export const DELETE = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const replyId = String(ctx.params?.replyId || '')
    if (!replyId) return jsonError('Invalid replyId', 400, 'VALIDATION_ERROR')

    const userId = ctx.user.userId
    const reply = await prisma.reply.findUnique({ where: { id: replyId }, select: { authorId: true } })
    if (!reply) return jsonError('Not found', 404, 'NOT_FOUND')
    if (reply.authorId !== userId) return jsonError('Forbidden', 403, 'FORBIDDEN')

    await prisma.reply.delete({ where: { id: replyId } })
    return new Response(null, { status: 204 })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

