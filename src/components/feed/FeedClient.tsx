'use client'

import * as React from 'react'
import type { User, Post } from '@/types'
import { usePosts } from '@/hooks/usePosts'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { PostCreator } from '@/components/feed/PostCreator'
import { PostCard } from '@/components/feed/PostCard'

function PostSkeleton() {
  return (
    <div className="glass-card animate-pulse rounded-2xl p-6 mb-6">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-200/60 ring-2 ring-white/50" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 w-1/3 rounded-full bg-slate-200/80" />
          <div className="h-3 w-20 rounded-full bg-slate-200/60" />
        </div>
      </div>
      <div className="mt-5 h-20 w-full rounded-xl bg-slate-200/50" />
      <div className="mt-5 aspect-video w-full rounded-xl bg-gradient-to-br from-slate-200/40 to-slate-100/20" />
    </div>
  )
}

export function FeedClient({ currentUser, initialPosts, initialNextCursor }: { currentUser: User, initialPosts: Post[], initialNextCursor: string | null }) {
  const { posts, isLoading, error, hasMore, fetchNextPage, addPost } = usePosts(initialPosts, initialNextCursor)

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: () => {
      if (!isLoading && hasMore) void fetchNextPage()
    },
    hasMore,
  })

  return (
    <>
      <PostCreator onCreated={addPost} />

      <div className="mt-4 space-y-4">
        {isLoading && posts.length === 0 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : null}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} currentUser={currentUser} />
        ))}
      </div>

      {error ? <div className="mt-6 text-center text-sm text-red-500">{error}</div> : null}

      {!isLoading && posts.length > 0 && !hasMore ? (
        <div className="mt-8 text-center text-sm text-[#767676]">No more posts</div>
      ) : null}

      <div ref={sentinelRef} className="h-12" />
    </>
  )
}
