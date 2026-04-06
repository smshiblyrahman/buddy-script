'use client'

import * as React from 'react'

type Args = {
  type: 'post' | 'comment' | 'reply'
  postId: string
  commentId?: string
  replyId?: string
  initialLiked: boolean
  initialCount: number
  onError?: (message: string) => void
}

function buildLikeUrl(type: Args['type'], postId: string, commentId?: string, replyId?: string) {
  if (type === 'post') return `/api/posts/${postId}/like`
  if (type === 'comment' && commentId) return `/api/posts/${postId}/comments/${commentId}/like`
  if (type === 'reply' && commentId && replyId)
    return `/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`
  return null
}

export function useLike({
  type,
  postId,
  commentId,
  replyId,
  initialLiked,
  initialCount,
  onError,
}: Args) {
  const [liked, setLiked] = React.useState(initialLiked)
  const [count, setCount] = React.useState(initialCount)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    setLiked(initialLiked)
    setCount(initialCount)
  }, [initialLiked, initialCount])

  const toggle = React.useCallback(async () => {
    const url = buildLikeUrl(type, postId, commentId, replyId)
    if (!url || isLoading) return

    setIsLoading(true)
    const prevLiked = liked
    const prevCount = count
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)))

    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error('Failed to toggle like')
      const body = (await res.json()) as { data: { liked: boolean; count: number } }
      setLiked(body.data.liked)
      setCount(body.data.count)
    } catch {
      setLiked(prevLiked)
      setCount(prevCount)
      onError?.('Could not update like. Try again.')
    } finally {
      setIsLoading(false)
    }
  }, [commentId, count, isLoading, liked, onError, postId, replyId, type])

  return { liked, count, toggle, isLoading }
}
