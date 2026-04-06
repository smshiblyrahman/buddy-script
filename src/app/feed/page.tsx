import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyJwt } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FeedPage } from '@/components/feed/FeedPage'
import { fetchFeedPosts } from '@/lib/feed'
import type { User } from '@/types'

export default async function Feed() {
  const cookieName = process.env.COOKIE_NAME ?? 'app_token'
  const token = (await cookies()).get(cookieName)?.value
  const payload = token ? await verifyJwt(token) : null
  const userId = typeof payload?.sub === 'string' ? payload.sub : null
  if (!userId) redirect('/login')

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
  if (!row) redirect('/login')

  const currentUser: User = {
    ...row,
    createdAt: row.createdAt.toISOString(),
  }

  const { data: initialPosts, nextCursor } = await fetchFeedPosts(userId, 10)

  return <FeedPage currentUser={currentUser} initialPosts={initialPosts} initialNextCursor={nextCursor} />
}
