'use client'

import * as React from 'react'

export function LikeButton({
  liked,
  count,
  onToggle,
  onCountClick,
  isLoading,
}: {
  liked: boolean
  count: number
  onToggle: () => void
  onCountClick: () => void
  isLoading: boolean
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={isLoading}
        onClick={onToggle}
        className={`inline-flex items-center gap-2 text-sm transition-colors duration-150 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {liked ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#ef4444">
              <path d="M12 21s-7-4.35-10-9.5C-0.5 6 2.5 2 6.5 2 8.9 2 10.8 3.2 12 4.7 13.2 3.2 15.1 2 17.5 2 21.5 2 24.5 6 22 11.5 19 16.65 12 21 12 21z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-4.35-10-9.5C-0.5 6 2.5 2 6.5 2 8.9 2 10.8 3.2 12 4.7 13.2 3.2 15.1 2 17.5 2 21.5 2 24.5 6 22 11.5 19 16.65 12 21 12 21z" />
            </svg>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={onCountClick}
        className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-150"
      >
        {count}
      </button>
    </div>
  )
}

