import Image from 'next/image'
import Link from 'next/link'
import { DESIGN_ASSET_FILES } from '@/lib/design-assets'

export const metadata = {
  title: 'Design assets | Buddy Script',
  description: 'All marketing and UI images from public/assets/images',
}

export default function DesignAssetsPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 py-10 font-[family-name:var(--font-poppins)]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A202C]">Design assets</h1>
            <p className="mt-1 text-sm text-[#4A5568]">
              Full set of files served from{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">/assets/images/</code> ({DESIGN_ASSET_FILES.length}{' '}
              files).
            </p>
          </div>
          <Link
            href="/feed"
            className="text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 hover:underline"
          >
            ← Back to feed
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {DESIGN_ASSET_FILES.map((name) => {
            const isSvg = name.endsWith('.svg')
            return (
              <figure
                key={name}
                className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm"
              >
                <div className="relative aspect-square w-full bg-[#FAFAFA]">
                  <Image
                    src={`/assets/images/${name}`}
                    alt={name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    unoptimized={isSvg}
                  />
                </div>
                <figcaption className="truncate border-t border-slate-100 px-2 py-1.5 text-center text-[10px] text-[#4A5568]">
                  {name}
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </div>
  )
}
