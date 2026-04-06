'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [show, setShow] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (res.status === 401) {
      setServerError('Invalid email or password')
      return
    }
    if (res.status === 429) {
      const ra = res.headers.get('Retry-After')
      const mins = ra ? Math.ceil(Number(ra) / 60) : 1
      setServerError(`Too many attempts. Try again in ${mins} minutes.`)
      return
    }
    if (!res.ok) {
      setServerError('Something went wrong. Please try again.')
      return
    }
    router.push('/feed')
  })

  return (
    <div className="w-full max-w-[420px] rounded-[6px] bg-white p-12 shadow-card">
      <div className="mb-7 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/logo.svg" alt="Logo" className="h-auto w-[161px]" />
      </div>
      <p className="mb-2 text-center text-base text-slate-700">Welcome back</p>
      <h1 className="mb-12 text-center text-[28px] font-medium leading-tight text-[#312000]">
        Login to your account
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#2D3748]">Email</label>
          <Input type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
          {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#2D3748]">Password</label>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              {...register('password')}
              className={errors.password ? 'border-red-500 pr-12' : 'pr-12'}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-900"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}
        </div>

        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}

        <Button type="submit" className="mt-6 h-11 w-full rounded-md" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Login now'}
        </Button>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">Or</span>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-500"
          title="Not wired in this demo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/google.svg" alt="" className="h-5 w-5" />
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Dont have an account?{' '}
        <Link href="/register" className="font-medium text-brand-500 hover:underline">
          Create New Account
        </Link>
      </p>
    </div>
  )
}

