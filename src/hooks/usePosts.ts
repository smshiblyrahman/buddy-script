'use client'

import * as React from 'react'
import type { Post, ApiError } from '@/types'

export function usePosts(initialPosts: Post[] = [], initialNextCursor: string | null = null) {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts)
  const [nextCursor, setNextCursor] = React.useState<string | null>(initialNextCursor)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Use a ref to safeguard against concurrent strict-mode fetches
  const isFetchingRef = React.useRef(false)

  const hasMore = nextCursor !== null

  const fetchNextPage = React.useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (nextCursor) qs.set('cursor', nextCursor)
      qs.set('limit', '10')
      const res = await fetch(`/api/posts?${qs.toString()}`)
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as ApiError | null
        throw new Error(j?.error ?? 'Failed to load posts')
      }
      const body = (await res.json()) as { data: Post[]; nextCursor?: string | null }
      setPosts((p) => {
        const uniqueData = body.data.filter(post => !p.some(existing => existing.id === post.id))
        return p.length === 0 ? body.data : [...p, ...uniqueData]
      })
      setNextCursor(body.nextCursor ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, nextCursor])

  const addPost = React.useCallback((post: Post) => {
    setPosts((p) => [post, ...p])
  }, [])

  const updatePost = React.useCallback((id: string, patch: Partial<Post>) => {
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }, [])

  const removePost = React.useCallback((id: string) => {
    setPosts((p) => p.filter((x) => x.id !== id))
  }, [])

  return { posts, nextCursor, isLoading, error, hasMore, fetchNextPage, addPost, updatePost, removePost }
}
