import { TopNav } from '@/components/layout/top-nav'
import { SideNav } from '@/components/layout/side-nav'
import { Footer } from '@/components/layout/footer'
import { Protected } from '@/components/auth/protected'

export default function CredentialsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <div className="flex flex-col min-h-screen">
        <TopNav />
        <div className="flex flex-1 max-w-container mx-auto w-full">
          <SideNav />
          <main className="flex-1 p-margin-desktop bg-[#FAF9F6] min-h-full">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </Protected>
  )
}
