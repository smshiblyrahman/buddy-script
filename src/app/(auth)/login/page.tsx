import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <section className="relative bg-[#F0F2F5] py-[100px]">
      <div className="pointer-events-none absolute left-0 top-0 -z-0 max-w-[min(100vw,320px)]">
        <Image
          src="/assets/images/shape1.svg"
          alt=""
          width={320}
          height={320}
          className="h-auto w-full max-w-[320px] object-contain object-left-top"
          unoptimized
        />
      </div>
      <div className="pointer-events-none absolute right-[20px] top-0 -z-0 max-w-[min(40vw,240px)]">
        <Image
          src="/assets/images/shape2.svg"
          alt=""
          width={240}
          height={240}
          className="h-auto w-full object-contain object-right-top"
          unoptimized
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-[max(0px,calc(50%-400px))] -z-0 hidden max-w-[220px] md:block">
        <Image
          src="/assets/images/shape3.svg"
          alt=""
          width={220}
          height={220}
          className="h-auto w-full object-contain"
          unoptimized
        />
      </div>
      <div className="pointer-events-none absolute bottom-2 left-0 -z-0 max-w-[200px] opacity-80">
        <Image
          src="/assets/images/dark_shape.svg"
          alt=""
          width={200}
          height={120}
          className="h-auto w-full object-contain object-left-bottom"
          unoptimized
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-8 lg:block">
            <div className="mx-auto w-full max-w-[633px]">
              <Image
                src="/assets/images/login.png"
                alt="Login illustration"
                width={633}
                height={520}
                priority
                sizes="(max-width: 1024px) 0vw, (max-width: 1280px) 50vw, 633px"
                className="h-auto w-full max-h-[min(75vh,560px)] object-contain object-center"
              />
            </div>
          </div>
          <div className="lg:col-span-4">
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  )
}

