'use client'

import * as React from 'react'

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
}: {
  onLoadMore: () => void
  hasMore: boolean
}) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting) onLoadMore()
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, onLoadMore])

  return { sentinelRef }
}

