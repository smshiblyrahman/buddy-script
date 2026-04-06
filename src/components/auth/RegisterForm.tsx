'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const schema = z
  .object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type FormValues = z.infer<typeof schema>

function strength(pw: string) {
  const hasLetter = /[a-zA-Z]/.test(pw)
  const hasNumber = /[0-9]/.test(pw)
  const score =
    (pw.length >= 8 ? 1 : 0) + (pw.length >= 12 ? 1 : 0) + (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0)
  if (score <= 2) return { label: 'weak', color: 'bg-red-500' }
  if (score === 3) return { label: 'fair', color: 'bg-amber-500' }
  return { label: 'strong', color: 'bg-green-500' }
}

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const pw = useWatch({ control, name: 'password' }) ?? ''
  const s = strength(pw)

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      }),
    })

    if (res.status === 409) {
      setServerError('An account with this email already exists')
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
      <p className="mb-2 text-center text-base text-slate-700">Get Started Now</p>
      <h1 className="mb-12 text-center text-[28px] font-medium leading-tight text-[#312000]">Registration</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2D3748]">First name</label>
            <Input {...register('firstName')} className={errors.firstName ? 'border-red-500' : ''} />
            {errors.firstName ? <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2D3748]">Last name</label>
            <Input {...register('lastName')} className={errors.lastName ? 'border-red-500' : ''} />
            {errors.lastName ? <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#2D3748]">Email</label>
          <Input type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
          {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#2D3748]">Password</label>
          <Input type="password" {...register('password')} className={errors.password ? 'border-red-500' : ''} />
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 rounded bg-slate-100">
              <div className={`h-2 rounded ${s.color}`} style={{ width: s.label === 'weak' ? '33%' : s.label === 'fair' ? '66%' : '100%' }} />
            </div>
            <span className="text-xs text-slate-600">{s.label}</span>
          </div>
          {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#2D3748]">Confirm password</label>
          <Input type="password" {...register('confirmPassword')} className={errors.confirmPassword ? 'border-red-500' : ''} />
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}

        <Button type="submit" className="mt-6 h-11 w-full rounded-md" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Register'}
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
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

