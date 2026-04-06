'use client'

import { useAuth } from '@/hooks/useAuth'

export function LogoutButton() {
  const { logout } = useAuth()
  
  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="cursor-pointer text-sm font-medium text-[#4A5568] transition-colors duration-150 hover:text-brand-500"
    >
      Log out
    </button>
  )
}
