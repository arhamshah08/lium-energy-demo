import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'

const ROLES = [
  {
    href: '/signup/developer',
    title: 'Project Developer',
    description: 'Register and onboard distributed energy assets onto the LIUM network.',
  },
  {
    href: '/signup/financier',
    title: 'Financier',
    description: 'Discover, evaluate, and finance verified energy projects on the LIUM network.',
  },
]

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-on-surface mb-2">Create an account</h1>
            <p className="text-on-surface-variant">Select your role to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ROLES.map(({ href, title, description }) => (
              <Link key={href} href={href} className="group">
                <div className="h-full p-10 rounded-xl border-2 border-outline-variant bg-surface-container-lowest
                  hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <h2 className="text-xl font-semibold text-on-surface mb-3 group-hover:text-primary transition-colors">
                    {title}
                  </h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-on-surface-variant mt-8">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
