import { prisma } from '@/lib/prisma'
import { redisGet, redisSet } from '@/lib/redis'
import type { Prisma } from '@prisma/client'
import type { Post } from '@/types'

export function parseFeedCursor(cursor?: string) {
  if (!cursor) return null
  const [iso, id] = cursor.split('::')
  if (!iso || !id) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return { createdAt: date, id }
}

export function toPostDto(post: any, userId: string) {
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
    _count: post._count,
    likedByMe: (post.likes?.length ?? 0) > 0,
    topComments: (post.comments ?? []).map((c: any) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      postId: c.postId,
      author: c.author,
      _count: { likes: c._count.likes, replies: c._count.replies },
      likedByMe: (c.likes?.length ?? 0) > 0,
    })),
  }
}

export async function fetchFeedPosts(userId: string, limit: number, cursor?: string): Promise<{ data: Post[]; nextCursor: string | null }> {
  try {
    const verRaw = await redisGet<string>(`feedver:${userId}`)
    const ver = verRaw ? Number(verRaw) : 0
    const feedSeq = String((await redisGet<string | number>('feed:seq')) ?? '0')
    const cacheKey = `feed:${userId}:v:${ver}:s:${feedSeq}:cursor:${cursor ?? 'start'}:${limit}`
    
    const cached = await redisGet<string>(cacheKey)
    if (cached) {
      const parsedCached = JSON.parse(cached) as { data: any[]; nextCursor: string | null }
      return parsedCached
    }

    const cursorObj = parseFeedCursor(cursor)

    const where: Prisma.PostWhereInput = {
      AND: [
        { OR: [{ visibility: 'PUBLIC' }, { visibility: 'PRIVATE', authorId: userId }] },
        ...(cursorObj
          ? [
              {
                OR: [
                  { createdAt: { lt: cursorObj.createdAt } },
                  { createdAt: cursorObj.createdAt, id: { lt: cursorObj.id } },
                ],
              },
            ]
          : []),
      ],
    }

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
        comments: {
          take: 2,
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            postId: true,
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            _count: { select: { likes: true, replies: true } },
            likes: { where: { userId }, select: { userId: true } },
          },
        },
      },
    })

    const hasMore = posts.length > limit
    const items = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore
      ? `${items[items.length - 1]!.createdAt.toISOString()}::${items[items.length - 1]!.id}`
      : null

    const dto = items.map((p) => toPostDto(p, userId)) as Post[]

    await redisSet(cacheKey, JSON.stringify({ data: dto, nextCursor }), { ex: 60 })
    return { data: dto, nextCursor }
  } catch (err) {
      // Return empty safely or bubble
      throw err;
  }
}
