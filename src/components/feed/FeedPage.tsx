import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { User, Post } from '@/types'
import { DESIGN_ASSET_FILES } from '@/lib/design-assets'
import { FeedClient } from '@/components/feed/FeedClient'
import { LogoutButton } from '@/components/layout/LogoutButton'

const explore = [
  'Learning',
  'Insights',
  'Find friends',
  'Bookmarks',
  'Group',
  'Gaming',
  'Settings',
  'Save post',
]

export function FeedPage({ currentUser, initialPosts, initialNextCursor }: { currentUser: User, initialPosts: Post[], initialNextCursor: string | null }) {


  const stories = [
    { img: '/assets/images/card_ppl1.png', label: 'Your Story', mine: true, mini: null as string | null },
    { img: '/assets/images/card_ppl2.png', label: 'Ryan Roslansky', mine: false, mini: '/assets/images/mini_pic.png' },
    { img: '/assets/images/card_ppl3.png', label: 'Ryan Roslansky', mine: false, mini: '/assets/images/mini_pic.png' },
    { img: '/assets/images/card_ppl4.png', label: 'Ryan Roslansky', mine: false, mini: '/assets/images/mini_pic.png' },
  ]

  const mobileHighlights = [
    { img: '/assets/images/mobile_story_img.png', label: 'Design' },
    { img: '/assets/images/mobile_story_img1.png', label: 'Team' },
    { img: '/assets/images/mobile_story_img2.png', label: 'Launch' },
  ]

  const suggestedPeople = [
    { n: 1, name: 'Steve Jobs', sub: 'Connect' },
    { n: 2, name: 'Ryan Roslansky', sub: 'Connect' },
    { n: 3, name: 'Dylan Field', sub: 'Connect' },
    { n: 4, name: 'Satya Nadella', sub: 'Connect' },
    { n: 5, name: 'Tim Cook', sub: 'Connect' },
    { n: 6, name: 'Sundar Pichai', sub: 'Connect' },
    { n: 7, name: 'Jensen Huang', sub: 'Connect' },
    { n: 8, name: 'Sam Altman', sub: 'Connect' },
    { n: 9, name: 'Marissa Mayer', sub: 'Connect' },
  ]

  const photoGrid = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `/assets/images/photos${i}.png`)
  const recommends = [1, 2, 3, 4].map((i) => `/assets/images/recommend${i}.png`)
  const groups = [1, 2, 3, 4, 5, 6].map((i) => `/assets/images/grp_ct${i}.png`)
  const chatPreview = [
    { img: '/assets/images/chat1_img.png', title: 'Product team', time: '2m' },
    { img: '/assets/images/chat2_img.png', title: 'Design sync', time: '12m' },
    { img: '/assets/images/chat3_img.png', title: 'Marketing', time: '1h' },
    { img: '/assets/images/chat4_img.png', title: 'Support', time: '2h' },
    { img: '/assets/images/chat5_img.png', title: 'Random', time: '1d' },
    { img: '/assets/images/chat6_img.png', title: 'Announcements', time: '2d' },
    { img: '/assets/images/chat7_img.png', title: 'Off-topic', time: '3d' },
  ]

  return (
    <div className="min-h-screen font-inter font-normal transition-colors duration-500 relative z-0">
      {/* Navbar with Frosted Glassmorphism */}
      <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/50 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 lg:max-w-[1140px]">
          <Link href="/feed" className="shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src="/assets/images/logo.svg"
              alt="Buddy Script"
              width={120}
              height={32}
              priority
              className="h-8 w-auto object-contain object-left"
            />
          </Link>
          
          <div className="relative mx-auto hidden max-w-md flex-1 md:block">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-500/70"
              viewBox="0 0 17 17"
              fill="none"
              aria-hidden
            >
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth={1.5} />
              <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M16 16l-3-3" />
            </svg>
            <input
              type="search"
              placeholder="Search people, posts, or groups..."
              className="h-11 w-full rounded-full border border-white/50 bg-white/40 py-2 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:bg-white/80 transition-all shadow-inner"
            />
          </div>
          
          <div className="ml-auto flex items-center gap-6">
            <Link
              href="/feed"
              className="text-slate-500 transition-all duration-300 hover:text-brand-600 hover:-translate-y-0.5 relative group"
              aria-label="Home"
            >
              <svg width={22} height={22} viewBox="0 0 18 21" fill="none" aria-hidden>
                <path
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z"
                />
              </svg>
              <span className="absolute -bottom-2 left-1/2 w-1 h-1 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2" />
            </Link>
            <div className="relative hover:scale-105 transition-transform duration-300 shadow-sm rounded-full cursor-pointer">
               <AvatarMini user={currentUser} />
               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full z-10" />
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Main Structural Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 lg:max-w-[1140px] animate-fade-up">
        <div className="grid gap-6 lg:grid-cols-12 relative z-10">
          
          <aside className="hidden lg:col-span-3 lg:block animate-fade-up [animation-delay:100ms]">
            <div className="space-y-6">
              
              <div className="rounded-2xl glass-card overflow-hidden">
                <div className="relative aspect-[5/2] w-full max-h-32 overflow-hidden bg-brand-100 mix-blend-multiply opacity-80 backdrop-grayscale">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <Image
                    src="/assets/images/friends_img.png"
                    alt=""
                    fill
                    className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
                    sizes="(max-width: 1280px) 30vw, 280px"
                    quality={85}
                  />
                  <div className="absolute bottom-3 left-4 z-20">
                     <p className="text-white font-outfit font-bold text-lg tracking-wide drop-shadow-md">Connect.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-5 glass-card glass-card-hover">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 font-outfit">Explore Network</h2>
                <ul className="space-y-1.5 text-sm font-medium text-slate-600">
                  {explore.map((label) => (
                    <li key={label}>
                      <span className="cursor-pointer block py-2 px-3 rounded-xl transition-all duration-300 hover:bg-white/60 hover:text-brand-600 hover:shadow-sm">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md bg-white p-6 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-[#212121]">Friend requests</h2>
                  <span className="cursor-pointer text-sm text-brand-500">See all</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src="/assets/images/friend-req.png"
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="48px"
                        quality={85}
                      />
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-[#1A202C]">Steve Jobs</p>
                      <p className="text-xs text-[#666]">wants to connect</p>
                    </div>
                  </div>
                  <div className="flex gap-3 border-t border-slate-100 pt-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src="/assets/images/profile-1.png"
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="48px"
                        quality={85}
                      />
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-[#1A202C]">Design guild</p>
                      <p className="text-xs text-[#666]">group invite</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-white p-6 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-medium text-[#212121]">Suggested People</h2>
                  <span className="cursor-pointer text-sm text-brand-500">See All</span>
                </div>
                <div className="max-h-[340px] space-y-0 overflow-y-auto pr-1">
                  {suggestedPeople.map((row) => (
                    <div
                      key={row.n}
                      className="flex items-center gap-3 border-t border-slate-100 py-2.5 first:border-0 first:pt-0"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                        <Image
                          src={`/assets/images/f${row.n}.png`}
                          alt=""
                          width={40}
                          height={40}
                          className="object-cover object-center"
                          quality={85}
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="truncate font-medium text-[#1A202C]">{row.name}</p>
                        <p className="text-xs text-[#666]">{row.sub}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 border-t border-slate-100 py-2.5">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      <Image
                        src="/assets/images/man.png"
                        alt=""
                        width={40}
                        height={40}
                        className="object-cover object-center"
                        quality={85}
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate font-medium text-[#1A202C]">Alex Morgan</p>
                      <p className="text-xs text-[#666]">Connect</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-6">
            <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto pb-2 md:mx-0">
              {stories.map((s, idx) => (
                <div
                  key={idx}
                  className={`relative h-28 w-24 shrink-0 overflow-hidden rounded-md ${s.mine ? 'ring-2 ring-brand-500/40' : ''}`}
                >
                  <Image
                    src={s.img}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="96px"
                    quality={85}
                  />
                  {s.mini ? (
                    <div className="absolute bottom-7 right-1 h-6 w-6 overflow-hidden rounded-full ring-2 ring-white">
                      <Image
                        src={s.mini}
                        alt=""
                        width={24}
                        height={24}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  ) : null}
                  <p className="absolute bottom-1 left-1 right-1 truncate text-center text-[10px] font-medium text-white drop-shadow">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto pb-2 md:mx-0 lg:hidden">
              {mobileHighlights.map((s, idx) => (
                <div key={idx} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={s.img}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                    quality={85}
                  />
                  <p className="absolute bottom-1 left-0 right-0 truncate text-center text-[10px] font-medium text-white drop-shadow">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <FeedClient currentUser={currentUser} initialPosts={initialPosts} initialNextCursor={initialNextCursor} />
          </main>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="space-y-4">
              <div className="rounded-md bg-white p-6 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-medium text-[#212121]">Events</h2>
                  <span className="cursor-pointer text-sm text-brand-500">See all</span>
                </div>
                <div className="overflow-hidden rounded-md border border-slate-100">
                  <div className="relative aspect-[16/10] w-full max-h-40 bg-slate-100">
                    <Image
                      src="/assets/images/feed_event1.png"
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 400px) 100vw, 320px"
                      quality={85}
                    />
                  </div>
                  <div className="p-3">
                    <div className="mb-2 flex -space-x-2">
                      <Image
                        src="/assets/images/people1.png"
                        alt=""
                        width={32}
                        height={32}
                        className="relative z-30 rounded-full object-cover object-center ring-2 ring-white"
                      />
                      <Image
                        src="/assets/images/people2.png"
                        alt=""
                        width={32}
                        height={32}
                        className="relative z-20 rounded-full object-cover object-center ring-2 ring-white"
                      />
                      <Image
                        src="/assets/images/people3.png"
                        alt=""
                        width={32}
                        height={32}
                        className="relative z-10 rounded-full object-cover object-center ring-2 ring-white"
                      />
                    </div>
                    <p className="text-sm font-medium text-[#1A202C]">No more terrorism no more cry</p>
                    <p className="mt-2 text-xs text-[#666]">17 People Going</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-white p-6 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-medium text-[#212121]">Photos</h2>
                  <span className="cursor-pointer text-sm text-brand-500">See all</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {photoGrid.map((src) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1280px) 12vw, 120px"
                        quality={80}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-6 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="mb-3 flex items-center gap-2">
                  <Image
                    src="/assets/images/recommend_mini.png"
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full object-cover object-center"
                  />
                  <h2 className="text-xl font-medium text-[#212121]">Recommended</h2>
                </div>
                <div className="space-y-3">
                  {recommends.map((src) => (
                    <div
                      key={src}
                      className="relative aspect-[16/9] w-full min-h-[6.5rem] overflow-hidden rounded-md bg-slate-100"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 400px) 100vw, 280px"
                        quality={85}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-md bg-white shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="relative aspect-[21/9] min-h-[8rem] w-full bg-slate-100">
                  <Image
                    src="/assets/images/top_img.png"
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 400px) 100vw, 320px"
                    quality={85}
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-[#1A202C]">Featured community</p>
                  <p className="mt-1 text-xs text-[#666]">Highlights from Buddy Script</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-md bg-white shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="relative h-28 w-full">
                  <Image
                    src="/assets/images/profile-cover-img.png"
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="320px"
                  />
                </div>
                <div className="relative -mt-10 px-4 pb-4">
                  <div className="mb-2 inline-block rounded-full border-4 border-white bg-white shadow-sm">
                    <Image
                      src="/assets/images/Avatar.png"
                      alt=""
                      width={72}
                      height={72}
                      className="rounded-full object-cover object-center"
                      quality={90}
                    />
                  </div>
                  <p className="text-sm font-medium text-[#1A202C]">Profile preview</p>
                  <p className="text-xs text-[#666]">Cover + avatar from the task asset pack</p>
                </div>
              </div>

              <div className="rounded-md bg-white p-6 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <h2 className="mb-3 text-xl font-medium text-[#212121]">Groups</h2>
                <div className="grid grid-cols-2 gap-2">
                  {groups.map((src) => (
                    <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 400px) 45vw, 160px"
                        quality={80}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="relative aspect-video overflow-hidden rounded-md bg-slate-100">
                    <Image
                      src="/assets/images/group-profile.png"
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 400px) 45vw, 160px"
                      quality={80}
                    />
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-md bg-slate-100">
                    <Image
                      src="/assets/images/group-single.png"
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 400px) 45vw, 160px"
                      quality={80}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-white p-6 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/assets/images/chat_profile.png"
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-full object-cover object-center"
                    />
                    <h2 className="text-xl font-medium text-[#212121]">Messages</h2>
                  </div>
                  <Image
                    src="/assets/images/chat_profile1.png"
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-full object-cover object-center opacity-80"
                  />
                </div>
                <div className="space-y-2">
                  {chatPreview.map((c) => (
                    <div key={c.title} className="flex items-center gap-2 rounded-md border border-slate-100 p-2">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={c.img}
                          alt=""
                          fill
                          className="object-cover object-center"
                          sizes="40px"
                          quality={80}
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="truncate font-medium text-[#1A202C]">{c.title}</p>
                        <p className="text-xs text-[#666]">{c.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 overflow-hidden rounded-md border border-slate-100">
                  <div className="relative aspect-[10/3] w-full overflow-hidden bg-slate-100">
                    <Image
                      src="/assets/images/chat_img.png"
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 400px) 100vw, 360px"
                      quality={85}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-white p-4 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#767676]">Spotlight</p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                      <Image
                        src={`/assets/images/slider${i}.png`}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 400px) 45vw, 160px"
                        quality={80}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-4 shadow-[0px_3px_30px_rgba(108,126,147,0.1)]">
                <p className="mb-2 text-xs text-[#4A5568]">More UI tiles</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded bg-slate-100">
                      <Image
                        src={`/assets/images/img${i}.png`}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="64px"
                        quality={75}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-dashed border-slate-200 bg-white/80 p-4 text-center shadow-sm">
                <Link
                  href="/design-assets"
                  className="text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 hover:underline"
                >
                  View all {DESIGN_ASSET_FILES.length} design files →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function AvatarMini({ user }: { user: User }) {
  if (user.avatarUrl) {
    return (
      <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200">
        <Image
          src={user.avatarUrl}
          alt=""
          width={36}
          height={36}
          className="object-cover object-center"
          quality={85}
          unoptimized={user.avatarUrl.startsWith('blob:') || user.avatarUrl.startsWith('data:')}
        />
      </div>
    )
  }
  return (
    <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200">
      <Image
        src="/assets/images/profile.png"
        alt=""
        width={36}
        height={36}
        className="object-cover object-center"
        quality={85}
      />
    </div>
  )
}
