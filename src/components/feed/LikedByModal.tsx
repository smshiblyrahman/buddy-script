'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'

type U = { id: string; firstName: string; lastName: string; avatarUrl: string | null }

export function LikedByModal({
  type,
  postId,
  commentId,
  replyId,
  isOpen,
  onClose,
}: {
  type: 'post' | 'comment' | 'reply'
  postId: string
  commentId?: string
  replyId?: string
  isOpen: boolean
  onClose: () => void
}) {
  const base =
    type === 'post'
      ? `/api/posts/${postId}/like`
      : type === 'comment' && commentId
        ? `/api/posts/${postId}/comments/${commentId}/like`
        : type === 'reply' && commentId && replyId
          ? `/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`
          : null

  const [users, setUsers] = React.useState<U[]>([])
  const [pageCursor, setPageCursor] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen || !base) return
    setUsers([])
    setPageCursor(null)
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const qs = new URLSearchParams({ limit: '20' })
        const res = await fetch(`${base}?${qs}`)
        if (!res.ok || cancelled) return
        const j = (await res.json()) as { data: U[]; nextCursor: string | null }
        if (!cancelled) {
          setUsers(j.data)
          setPageCursor(j.nextCursor ?? null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isOpen, base])

  async function loadMore() {
    if (!base || !pageCursor || loading) return
    setLoading(true)
    try {
      const qs = new URLSearchParams({ limit: '20', cursor: pageCursor })
      const res = await fetch(`${base}?${qs}`)
      if (!res.ok) return
      const j = (await res.json()) as { data: U[]; nextCursor: string | null }
      setUsers((u) => [...u, ...j.data])
      setPageCursor(j.nextCursor ?? null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Liked by">
      {!base ? (
        <div className="text-sm text-slate-600">Invalid like target.</div>
      ) : (
        <div className="max-h-[60vh] overflow-auto">
          <div className="space-y-1">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-slate-50"
              >
                <Avatar user={u} size="sm" />
                <div className="text-sm text-slate-900">
                  {u.firstName} {u.lastName}
                </div>
              </div>
            ))}
          </div>
          {pageCursor ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              className="mt-3 w-full cursor-pointer rounded-md border border-slate-200 py-2 text-sm transition-colors duration-150 hover:bg-slate-50"
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          ) : null}
        </div>
      )}
    </Modal>
  )
}
