import { Header } from '@/components/shop/Header'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2026 HomePlug.com All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
