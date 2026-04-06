import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const cookieName = process.env.COOKIE_NAME ?? 'app_token'
  const token = (await cookies()).get(cookieName)?.value

  if (token) {
    redirect('/feed')
  }

  redirect('/login')
}

