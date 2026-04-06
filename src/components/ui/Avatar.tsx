import Image from 'next/image'
import type { User } from '@/types'

export function Avatar({
  user,
  size = 'md',
}: {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>
  size?: 'sm' | 'md' | 'lg'
}) {
  const px = size === 'sm' ? 28 : size === 'lg' ? 48 : 36

  if (user.avatarUrl) {
    return (
      <div className="overflow-hidden rounded-full" style={{ width: px, height: px }}>
        <Image
          src={user.avatarUrl}
          alt="Avatar"
          width={px}
          height={px}
          className="h-full w-full object-cover object-center"
          unoptimized={user.avatarUrl.startsWith('blob:') || user.avatarUrl.startsWith('data:')}
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-full" style={{ width: px, height: px }} aria-label="Avatar">
      <Image
        src="/assets/images/profile.png"
        alt=""
        width={px}
        height={px}
        className="h-full w-full object-cover object-center"
      />
    </div>
  )
}
