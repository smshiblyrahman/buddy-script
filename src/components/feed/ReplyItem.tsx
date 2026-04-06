'use client'

import * as React from 'react'
import type { Reply, User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { LikeButton } from '@/components/feed/LikeButton'
import { LikedByModal } from '@/components/feed/LikedByModal'
import { useLike } from '@/hooks/useLike'

function timeAgo(iso: string) {
  const t = new Date(iso).getTime()
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000))
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return `${s}s ago`
}

export function ReplyItem({
  postId,
  commentId,
  reply,
  currentUser,
  onDeleted,
}: {
  postId: string
  commentId: string
  reply: Reply
  currentUser: User
  onDeleted: () => void
}) {
  const [toast, setToast] = React.useState<string | null>(null)
  const [likedByOpen, setLikedByOpen] = React.useState(false)
  const { liked, count, toggle, isLoading } = useLike({
    type: 'reply',
    postId,
    commentId,
    replyId: reply.id,
    initialLiked: reply.likedByMe,
    initialCount: reply._count.likes,
    onError: setToast,
  })

  async function del() {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}/replies/${reply.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('fail')
      onDeleted()
    } catch {
      setToast('Could not delete reply.')
    }
  }

  return (
    <div className="border-t border-slate-100 py-2 pl-8">
      <div className="flex items-start gap-2">
        <Avatar user={reply.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#1A202C]">
              {reply.author.firstName} {reply.author.lastName}
            </span>
            <span className="text-xs text-slate-500">{timeAgo(reply.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-sm text-[#4A5568] whitespace-pre-wrap">{reply.content}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <LikeButton
              liked={liked}
              count={count}
              onToggle={() => void toggle()}
              onCountClick={() => setLikedByOpen(true)}
              isLoading={isLoading}
            />
            {reply.author.id === currentUser.id ? (
              <button
                type="button"
                onClick={() => void del()}
                className="cursor-pointer text-xs text-red-600 transition-colors duration-150 hover:text-red-700"
              >
                Delete
              </button>
            ) : null}
          </div>
          {toast ? <p className="mt-1 text-xs text-red-500">{toast}</p> : null}
        </div>
      </div>
      <LikedByModal
        type="reply"
        postId={postId}
        commentId={commentId}
        replyId={reply.id}
        isOpen={likedByOpen}
        onClose={() => setLikedByOpen(false)}
      />
    </div>
  )
}
