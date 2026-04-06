import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { createCommentSchema, paginationSchema } from '@/lib/validations'
import { jsonData, jsonError, safeErrorMessage } from '@/lib/api-utils'

function parseCursor(cursor?: string) {
  if (!cursor) return null
  const [iso, id] = cursor.split('::')
  if (!iso || !id) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return { createdAt: date, id }
}

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const postId = String(ctx.params?.postId || '')
    if (!postId) return jsonError('Invalid postId', 400, 'VALIDATION_ERROR')

    const json = await req.json().catch(() => null)
    const parsed = createCommentSchema.safeParse(json)
    if (!parsed.success) return jsonError('Invalid input', 400, 'VALIDATION_ERROR')

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: ctx.user.userId,
        content: parsed.data.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        postId: true,
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { likes: true, replies: true } },
      },
    })

    return jsonData(
      {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        likedByMe: false,
      },
      { status: 201 },
    )
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
    const cursorObj = parseCursor(cursor)
    const userId = ctx.user.userId

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        ...(cursorObj
          ? {
              OR: [
                { createdAt: { gt: cursorObj.createdAt } },
                { createdAt: cursorObj.createdAt, id: { gt: cursorObj.id } },
              ],
            }
          : {}),
      },
      take: limit + 1,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        content: true,
        createdAt: true,
        postId: true,
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { likes: true, replies: true } },
        likes: { where: { userId }, select: { userId: true } },
      },
    })

    const hasMore = comments.length > limit
    const items = hasMore ? comments.slice(0, limit) : comments
    const nextCursor = hasMore
      ? `${items[items.length - 1]!.createdAt.toISOString()}::${items[items.length - 1]!.id}`
      : null

    return jsonData(
      items.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        postId: c.postId,
        author: c.author,
        _count: { likes: c._count.likes, replies: c._count.replies },
        likedByMe: c.likes.length > 0,
      })),
      { status: 200, nextCursor },
    )
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

