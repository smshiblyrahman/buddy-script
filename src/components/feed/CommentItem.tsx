'use client'

import * as React from 'react'
import type { Comment, Reply, User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { LikeButton } from '@/components/feed/LikeButton'
import { LikedByModal } from '@/components/feed/LikedByModal'
import { ReplyItem } from '@/components/feed/ReplyItem'
import { useLike } from '@/hooks/useLike'
import { Button } from '@/components/ui/Button'

function timeAgo(iso: string) {
  const t = new Date(iso).getTime()
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000))
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return `${s}s ago`
}

export function CommentItem({
  postId,
  comment,
  currentUser,
  onDeleted,
  onReplyCountDelta,
}: {
  postId: string
  comment: Comment
  currentUser: User
  onDeleted: () => void
  onReplyCountDelta: (delta: number) => void
}) {
  const [repliesOpen, setRepliesOpen] = React.useState(false)
  const [replies, setReplies] = React.useState<Reply[] | null>(null)
  const [repliesLoading, setRepliesLoading] = React.useState(false)
  const [showReplyBox, setShowReplyBox] = React.useState(false)
  const [replyText, setReplyText] = React.useState('')
  const [replySubmitting, setReplySubmitting] = React.useState(false)
  const [toast, setToast] = React.useState<string | null>(null)
  const [likedByOpen, setLikedByOpen] = React.useState(false)

  const { liked, count, toggle, isLoading } = useLike({
    type: 'comment',
    postId,
    commentId: comment.id,
    initialLiked: comment.likedByMe,
    initialCount: comment._count.likes,
    onError: setToast,
  })

  async function loadReplies() {
    if (replies !== null || repliesLoading) return
    setRepliesLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/replies`)
      if (!res.ok) throw new Error('fail')
      const j = (await res.json()) as { data: Reply[] }
      setReplies(j.data)
    } catch {
      setToast('Could not load replies.')
    } finally {
      setRepliesLoading(false)
    }
  }

  function toggleReplies() {
    const next = !repliesOpen
    setRepliesOpen(next)
    if (next && comment._count.replies > 0) void loadReplies()
  }

  async function submitReply() {
    const t = replyText.trim()
    if (!t || replySubmitting) return
    setReplySubmitting(true)
    setToast(null)

    let base = replies
    if (base === null) {
      if (comment._count.replies > 0) {
        setRepliesLoading(true)
        try {
          const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/replies`)
          if (!res.ok) throw new Error('fail')
          const j = (await res.json()) as { data: Reply[] }
          base = j.data
          setReplies(base)
        } catch {
          setToast('Could not load replies.')
          setReplySubmitting(false)
          setRepliesLoading(false)
          return
        } finally {
          setRepliesLoading(false)
        }
      } else {
        base = []
      }
    }

    const tempId = `optimistic-reply-${Date.now()}`
    const optimistic: Reply = {
      id: tempId,
      content: t,
      createdAt: new Date().toISOString(),
      commentId: comment.id,
      author: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatarUrl: currentUser.avatarUrl,
      },
      _count: { likes: 0 },
      likedByMe: false,
    }
    setReplies([...base, optimistic])
    setReplyText('')
    setShowReplyBox(false)
    setRepliesOpen(true)
    onReplyCountDelta(1)

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: t }),
      })
      if (!res.ok) throw new Error('fail')
      const j = (await res.json()) as { data: Reply }
      setReplies((r) => (r ? r.map((x) => (x.id === tempId ? j.data : x)) : [j.data]))
    } catch {
      setReplies((r) => (r ?? []).filter((x) => x.id !== tempId))
      onReplyCountDelta(-1)
      setToast('Could not post reply.')
    } finally {
      setReplySubmitting(false)
    }
  }

  async function del() {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('fail')
      onDeleted()
    } catch {
      setToast('Could not delete comment.')
    }
  }

  return (
    <div className="py-3 first:pt-1">
      <div className="flex items-start gap-2">
        <Avatar user={comment.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#1A202C]">
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-sm text-[#4A5568] whitespace-pre-wrap">{comment.content}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <LikeButton
              liked={liked}
              count={count}
              onToggle={() => void toggle()}
              onCountClick={() => setLikedByOpen(true)}
              isLoading={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowReplyBox((v) => !v)}
              className="cursor-pointer text-xs font-medium text-slate-600 transition-colors duration-150 hover:text-slate-900"
            >
              Reply
            </button>
            {comment._count.replies > 0 ? (
              <button
                type="button"
                onClick={() => toggleReplies()}
                className="cursor-pointer text-xs font-medium text-brand-500 transition-colors duration-150 hover:text-blue-600"
              >
                {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
              </button>
            ) : null}
            {comment.author.id === currentUser.id ? (
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

          {showReplyBox ? (
            <div className="mt-2 flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply…"
                className="flex-1 resize-none rounded-md border border-slate-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
              <Button
                type="button"
                className="self-end"
                disabled={replySubmitting || !replyText.trim()}
                onClick={() => void submitReply()}
              >
                Reply
              </Button>
            </div>
          ) : null}

          {repliesOpen && replies !== null && replies.length > 0 ? (
            <div className="mt-1 rounded-md border border-slate-100 bg-white/70">
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  postId={postId}
                  commentId={comment.id}
                  reply={reply}
                  currentUser={currentUser}
                  onDeleted={() => {
                    setReplies((r) => (r ? r.filter((x) => x.id !== reply.id) : []))
                    onReplyCountDelta(-1)
                  }}
                />
              ))}
            </div>
          ) : null}
          {repliesOpen && repliesLoading ? (
            <p className="mt-2 text-xs text-slate-500">Loading replies…</p>
          ) : null}
        </div>
      </div>
      <LikedByModal
        type="comment"
        postId={postId}
        commentId={comment.id}
        isOpen={likedByOpen}
        onClose={() => setLikedByOpen(false)}
      />
    </div>
  )
}
