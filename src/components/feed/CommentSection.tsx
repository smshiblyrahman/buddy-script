'use client'

import * as React from 'react'
import Image from 'next/image'
import type { Comment, User } from '@/types'
import { CommentItem } from '@/components/feed/CommentItem'
import { Button } from '@/components/ui/Button'

export function CommentSection({
  postId,
  initialComments,
  initialNextCursor,
  currentUser,
  onCommentCountDelta,
}: {
  postId: string
  initialComments: Comment[]
  initialNextCursor: string | null
  currentUser: User
  onCommentCountDelta: (delta: number) => void
}) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments)
  const [nextCursor, setNextCursor] = React.useState<string | null>(initialNextCursor)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [text, setText] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [toast, setToast] = React.useState<string | null>(null)

  React.useEffect(() => {
    setComments(initialComments)
    setNextCursor(initialNextCursor)
  }, [initialComments, initialNextCursor, postId])

  async function loadMore() {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const qs = new URLSearchParams({ limit: '10', cursor: nextCursor })
      const res = await fetch(`/api/posts/${postId}/comments?${qs}`)
      if (!res.ok) throw new Error('load')
      const j = (await res.json()) as { data: Comment[]; nextCursor: string | null }
      setComments((c) => {
        const newComments = j.data.filter(nc => !c.some(existing => existing.id === nc.id));
        return [...c, ...newComments]
      })
      setNextCursor(j.nextCursor ?? null)
    } catch {
      setToast('Could not load comments.')
    } finally {
      setLoadingMore(false)
    }
  }

  async function submit() {
    const t = text.trim()
    if (!t || submitting) return
    setSubmitting(true)
    setToast(null)
    const tempId = `optimistic-${Date.now()}`
    const optimistic: Comment = {
      id: tempId,
      content: t,
      createdAt: new Date().toISOString(),
      postId,
      author: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatarUrl: currentUser.avatarUrl,
      },
      _count: { likes: 0, replies: 0 },
      likedByMe: false,
    }
    setComments((c) => [...c, optimistic])
    setText('')
    onCommentCountDelta(1)

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: t }),
      })
      if (!res.ok) throw new Error('fail')
      const j = (await res.json()) as { data: Comment }
      setComments((c) => c.map((x) => (x.id === tempId ? j.data : x)))
    } catch {
      setComments((c) => c.filter((x) => x.id !== tempId))
      onCommentCountDelta(-1)
      setToast('Could not post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  function removeComment(commentId: string) {
    setComments((c) => c.filter((x) => x.id !== commentId))
  }

  return (
    <div className="mt-3 rounded-md border border-[#E8E8E8] bg-[#F5F5F5] p-3">
      <div className="flex gap-2">
        <div className="hidden shrink-0 flex-col items-center gap-1 pt-1 sm:flex">
          <div className="relative h-9 w-9 overflow-hidden rounded-full">
            <Image
              src="/assets/images/comment_img.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="36px"
              quality={85}
            />
          </div>
          <Image
            src="/assets/images/txt_img.png"
            alt=""
            width={36}
            height={40}
            className="object-contain object-center opacity-90"
          />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          rows={2}
          className="min-h-[64px] flex-1 resize-none rounded-md border border-slate-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        />
        <Button type="button" className="self-end" disabled={submitting || !text.trim()} onClick={() => void submit()}>
          Post
        </Button>
      </div>
      {toast ? <p className="mt-2 text-xs text-red-500">{toast}</p> : null}
      <div className="mt-3 space-y-1 divide-y divide-slate-200/80">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            postId={postId}
            comment={comment}
            currentUser={currentUser}
            onDeleted={() => {
              removeComment(comment.id)
              onCommentCountDelta(-1)
            }}
            onReplyCountDelta={(n) => {
              const cid = comment.id
              setComments((c) =>
                c.map((x) =>
                  x.id === cid
                    ? {
                        ...x,
                        _count: {
                          likes: x._count.likes,
                          replies: Math.max(0, x._count.replies + n),
                        },
                      }
                    : x,
                ),
              )
            }}
          />
        ))}
      </div>
      {nextCursor ? (
        <button
          type="button"
          className="mt-3 w-full cursor-pointer py-2 text-center text-sm font-medium text-brand-500 transition-colors duration-150 hover:text-blue-600 disabled:opacity-50"
          disabled={loadingMore}
          onClick={() => void loadMore()}
        >
          {loadingMore ? 'Loading…' : 'Load more comments'}
        </button>
      ) : null}
    </div>
  )
}
