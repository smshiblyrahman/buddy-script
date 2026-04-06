'use client'

import * as React from 'react'
import Image from 'next/image'
import type { Post, User, Comment } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { LikeButton } from '@/components/feed/LikeButton'
import { LikedByModal } from '@/components/feed/LikedByModal'
import { CommentSection } from '@/components/feed/CommentSection'

function timeAgo(iso: string) {
  const t = new Date(iso).getTime()
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000))
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return `${s}s ago`
}

export function PostCard({ post, currentUser }: { post: Post; currentUser: User }) {
  const [expanded, setExpanded] = React.useState(false)
  const [liked, setLiked] = React.useState(post.likedByMe)
  const [count, setCount] = React.useState(post._count.likes)
  const [isLoading, setIsLoading] = React.useState(false)
  const [likedByOpen, setLikedByOpen] = React.useState(false)
  const [commentsOpen, setCommentsOpen] = React.useState(false)
  const [commentCount, setCommentCount] = React.useState(post._count.comments)
  const [likeToast, setLikeToast] = React.useState<string | null>(null)

  React.useEffect(() => {
    setCommentCount(post._count.comments)
  }, [post._count.comments, post.id])

  React.useEffect(() => {
    setLiked(post.likedByMe)
    setCount(post._count.likes)
  }, [post.id, post.likedByMe, post._count.likes])

  async function toggleLike() {
    if (isLoading) return
    setIsLoading(true)
    setLikeToast(null)
    const prevLiked = liked
    const prevCount = count
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)))
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('failed')
      const j = (await res.json()) as { data: { liked: boolean; count: number } }
      setLiked(j.data.liked)
      setCount(j.data.count)
    } catch {
      setLiked(prevLiked)
      setCount(prevCount)
      setLikeToast('Could not update like. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (post.visibility === 'PRIVATE' && post.author.id !== currentUser.id) {
    return null
  }

  const content = post.content ?? ''
  const shouldTruncate = content.length > 300
  const shown = shouldTruncate && !expanded ? `${content.slice(0, 300)}…` : content

  const seed = post.topComments ?? []
  const hasMoreComments = post._count.comments > seed.length
  const initialNextCursor: string | null =
    hasMoreComments && seed.length > 0
      ? `${seed[seed.length - 1]!.createdAt}::${seed[seed.length - 1]!.id}`
      : null

  const initialComments: Comment[] = seed

  return (
    <article className="glass-card glass-card-hover rounded-2xl p-6 mb-6 animate-scale-in">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100 shadow-sm transition-transform hover:scale-105 cursor-pointer">
          <Avatar user={post.author} size="md" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="truncate font-outfit font-semibold text-lg text-slate-800 transition-colors hover:text-brand-600 cursor-pointer">
              {post.author.firstName} {post.author.lastName}
            </span>
            {post.visibility === 'PRIVATE' ? (
              <span className="rounded-full bg-slate-100/80 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Private</span>
            ) : null}
          </div>
          <div className="text-xs text-slate-500 font-inter mt-0.5 tracking-wide">{timeAgo(post.createdAt)}</div>
        </div>
      </div>

      <div className="mt-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-inter">
        {shown}{' '}
        {shouldTruncate ? (
          <button
            type="button"
            className="cursor-pointer font-medium text-brand-600 transition-all duration-300 hover:text-brand-700 hover:underline hover:translate-x-0.5 inline-block"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        ) : null}
      </div>

      {post.imageUrl ? (
        <div className="mt-4 overflow-hidden rounded-md">
          <div className="relative aspect-video w-full bg-slate-100/50 rounded-xl overflow-hidden shadow-inner">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, min(640px, 100vw)"
              quality={85}
              unoptimized={
                post.imageUrl.startsWith('blob:') || post.imageUrl.startsWith('data:')
              }
            />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1 border-b border-[#F0F2F5] pb-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Image
            key={i}
            src={`/assets/images/react_img${i}.png`}
            alt=""
            width={28}
            height={28}
            className="rounded-full object-cover object-center"
            quality={85}
          />
        ))}
      </div>

      {likeToast ? <p className="mt-2 text-xs text-red-500">{likeToast}</p> : null}

      <div className="mt-4 flex items-center justify-between border-t border-[#F0F2F5] pt-3">
        <LikeButton
          liked={liked}
          count={count}
          isLoading={isLoading}
          onToggle={toggleLike}
          onCountClick={() => setLikedByOpen(true)}
        />
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className="cursor-pointer text-sm text-[#4A5568] transition-colors duration-150 hover:text-[#1A202C]"
        >
          {commentCount} comments
        </button>
      </div>

      {commentsOpen ? (
        <CommentSection
          postId={post.id}
          initialComments={initialComments}
          initialNextCursor={initialNextCursor}
          currentUser={currentUser}
          onCommentCountDelta={(d) => setCommentCount((c) => Math.max(0, c + d))}
        />
      ) : null}

      <LikedByModal type="post" postId={post.id} isOpen={likedByOpen} onClose={() => setLikedByOpen(false)} />
    </article>
  )
}
