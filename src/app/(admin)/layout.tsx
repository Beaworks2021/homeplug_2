import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Package, ShoppingBag, Tags, Image as ImageIcon, LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r fixed h-full z-10">
        <div className="p-6 border-b">
          <Link href="/admin/dashboard" className="block">
            <Logo className="scale-90 origin-left" />
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/admin/products" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Package className="w-5 h-5" />
            Products
          </Link>
          <Link 
            href="/admin/orders" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
          </Link>
          <div className="pt-4 mt-4 border-t">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Marketing</p>
            <Link 
                href="/admin/brands" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
                <Tags className="w-5 h-5" />
                Brands
            </Link>
            <Link 
                href="/admin/categories" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
                <Tags className="w-5 h-5" />
                Categories
            </Link>
            <Link 
                href="/admin/carousel" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
                <ImageIcon className="w-5 h-5" />
                Carousel
            </Link>
          </div>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
