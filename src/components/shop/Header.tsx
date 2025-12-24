'use client'

import Link from 'next/link'
import { ShoppingCart as CartIcon, X, Trash2, Menu, ChevronDown } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Logo } from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

type NavigationData = {
    brands: { id: string, name: string }[]
    categories: { id: string, name: string, slug: string }[]
}

export function Header() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity } = useCart()
  const [mounted, setMounted] = useState(false)
  const [navData, setNavData] = useState<NavigationData>({ brands: [], categories: [] })
  const [activeMenu, setActiveMenu] = useState<'categories' | 'brands' | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const fetchData = async () => {
        const supabase = createClient()
        const [brands, categories] = await Promise.all([
            supabase.from('brands').select('id, name').order('name'),
            supabase.from('categories').select('id, name, slug').order('name')
        ])
        setNavData({
            brands: brands.data || [],
            categories: categories.data || []
        })
    }
    fetchData()
  }, [])

  useEffect(() => {
    setActiveMenu(null)
    setIsOpen(false)
  }, [pathname])

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  // Avoid hydration mismatch
  if (!mounted) return (
      <header className="border-b sticky top-0 bg-white z-10 h-16">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <Link href="/">
                <Logo />
            </Link>
            <div className="p-2 rounded-full relative bg-gray-100">
                <CartIcon className="w-6 h-6 text-gray-400" />
            </div>
          </div>
      </header>
  )

  return (
    <>
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
                <Logo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
                {/* Categories Menu */}
                <div 
                    className="relative group"
                    onMouseEnter={() => setActiveMenu('categories')}
                    onMouseLeave={() => setActiveMenu(null)}
                >
                    <button className="flex items-center gap-1 font-medium hover:text-blue-600 py-4">
                        Categories <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <div className={`absolute top-full left-0 w-64 bg-white shadow-xl border rounded-xl p-4 transition-all duration-200 transform origin-top-left ${activeMenu === 'categories' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                        <ul className="space-y-2">
                            {navData.categories.map(category => (
                                <li key={category.id}>
                                    <Link 
                                        href={`/category/${category.id}`} 
                                        prefetch={false}
                                        className="text-gray-600 hover:text-blue-600 block py-1"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                            {navData.categories.length === 0 && <li className="text-gray-400 text-sm">No categories yet</li>}
                        </ul>
                    </div>
                </div>

                {/* Brands Menu */}
                <div 
                    className="relative group"
                    onMouseEnter={() => setActiveMenu('brands')}
                    onMouseLeave={() => setActiveMenu(null)}
                >
                    <button className="flex items-center gap-1 font-medium hover:text-blue-600 py-4">
                        Brands <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <div className={`absolute top-full left-0 w-64 bg-white shadow-xl border rounded-xl p-4 transition-all duration-200 transform origin-top-left ${activeMenu === 'brands' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                        <ul className="space-y-2">
                            {navData.brands.map(brand => (
                                <li key={brand.id}>
                                    <Link 
                                        href={`/brand/${brand.id}`} 
                                        prefetch={false}
                                        className="text-gray-600 hover:text-blue-600 block py-1"
                                    >
                                        {brand.name}
                                    </Link>
                                </li>
                            ))}
                            {navData.brands.length === 0 && <li className="text-gray-400 text-sm">No brands yet</li>}
                        </ul>
                    </div>
                </div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full relative transition-colors"
            >
              <CartIcon className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Cart Slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Shopping Cart ({cart.length})</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <CartIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => {
                    return (
                        <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                                {item.image_url ? (
                                    <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-medium line-clamp-1">{item.title}</h3>
                                    <p className="text-gray-500 text-sm">₵{item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2 border rounded-md p-1">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                        >-</button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                                        >+</button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-gray-600">Subtotal</span>
                  <span className="text-xl font-bold">₵{total.toFixed(2)}</span>
                </div>
                <Link 
                  href="/checkout"
                  prefetch={false}
                  className="block w-full bg-black text-white text-center py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                >
                  Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
