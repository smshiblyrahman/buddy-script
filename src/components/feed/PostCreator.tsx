'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/feed/ImageUploader'
import type { Post, PostVisibility } from '@/types'

export function PostCreator({ onCreated }: { onCreated: (post: Post) => void }) {
  const [content, setContent] = React.useState('')
  const [visibility, setVisibility] = React.useState<PostVisibility>('PUBLIC')
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const remaining = 2000 - content.length

  async function submit() {
    if (!content.trim() || content.length > 2000) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl: imageUrl ?? undefined, visibility }),
      })
      if (!res.ok) {
        let msg = 'Failed to create post'
        try {
          const errBody = await res.json()
          msg = errBody.error || msg
        } catch {}
        throw new Error(msg)
      }
      const j = (await res.json()) as { data: Post }
      onCreated(j.data)
      setContent('')
      setImageUrl(null)
      setVisibility('PUBLIC')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-md bg-white p-4 shadow-card">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full resize-none rounded-md border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        rows={3}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
        <div className="inline-flex overflow-hidden rounded-full border border-slate-200">
          <button
            type="button"
            onClick={() => setVisibility('PUBLIC')}
            className={`px-3 py-1 ${visibility === 'PUBLIC' ? 'bg-brand-500 text-white' : 'bg-white'}`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => setVisibility('PRIVATE')}
            className={`px-3 py-1 ${visibility === 'PRIVATE' ? 'bg-brand-500 text-white' : 'bg-white'}`}
          >
            Private
          </button>
        </div>
        <span className={remaining < 0 ? 'text-red-500' : ''}>{remaining} remaining</span>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
        <Image
          src="/assets/images/line.svg"
          alt=""
          width={120}
          height={8}
          className="h-2 w-auto object-left object-contain opacity-60"
          unoptimized
        />
        <div className="flex items-center gap-1.5 text-slate-400">
          <Image src="/assets/images/Path.svg" alt="" width={14} height={14} className="object-contain" unoptimized />
          <Image src="/assets/images/Caretdown.svg" alt="" width={12} height={12} className="object-contain" unoptimized />
        </div>
      </div>

      <div className="mt-3">
        <ImageUploader onUpload={(url) => setImageUrl(url)} />
      </div>

      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={isLoading || !content.trim() || remaining < 0}>
          Post
        </Button>
      </div>
    </div>
  )
}

