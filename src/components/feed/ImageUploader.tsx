'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export function ImageUploader({ onUpload }: { onUpload: (publicUrl: string) => void }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<number>(0)
  const [error, setError] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  React.useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function validate(f: File) {
    if (!ALLOWED.includes(f.type as any)) return 'Unsupported file type'
    if (f.size > MAX_BYTES) return 'File must be ≤ 5MB'
    return null
  }

  async function startUpload(f: File) {
    setError(null)
    const v = validate(f)
    if (v) {
      setError(v)
      return
    }

    setIsUploading(true)
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('file', f)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const json = await res.json()
      onUpload(json.data.publicUrl)
      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  function onPick(f: File | null) {
    setFile(f)
    setProgress(0)
    setError(null)
    if (f) void startUpload(f)
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null
    onPick(picked)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0] ?? null
    onPick(f)
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3"
      >
        <div className="text-xs text-slate-600">
          Drag & drop an image here, or choose a file (≤ 5MB).
        </div>
        <input
          ref={fileInputRef}
          id="post-image-file-input"
          type="file"
          accept={ALLOWED.join(',')}
          className="sr-only"
          onChange={onFileInputChange}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isUploading}
          aria-label="Choose image file (max 5MB)"
          onClick={() => fileInputRef.current?.click()}
        >
          Pick file
        </Button>
      </div>

      {preview ? (
        <div className="mt-3 overflow-hidden rounded-md border border-slate-200">
          <div className="relative aspect-video w-full bg-slate-100">
            {/* blob: URLs are not supported by the image optimizer; unoptimized is required */}
            <Image
              src={preview}
              alt="Preview"
              fill
              unoptimized
              className="object-cover object-center"
            />
          </div>
        </div>
      ) : null}

      {isUploading ? (
        <div className="mt-2 text-xs text-slate-600">Uploading… {progress}%</div>
      ) : null}
      {error ? <div className="mt-2 text-xs text-red-500">{error}</div> : null}
    </div>
  )
}

