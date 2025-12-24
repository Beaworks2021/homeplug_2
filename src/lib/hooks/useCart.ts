import { useState, useEffect } from 'react'
import { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

export interface CartItem extends Product {
  quantity: number
}

// Custom event to sync cart across components
const CART_UPDATED_EVENT = 'cart-updated'
const CART_OPEN_EVENT = 'cart-open-toggle'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial cart
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      setCart(JSON.parse(stored))
    }
    setIsLoaded(true)
  }, [])

  // Listen for external updates
  useEffect(() => {
    const handleStorageChange = () => {
        const stored = localStorage.getItem('cart')
        if (stored) {
            setCart(JSON.parse(stored))
        }
    }

    const handleOpenToggle = (e: any) => {
        setIsOpen(e.detail)
    }

    window.addEventListener(CART_UPDATED_EVENT, handleStorageChange)
    window.addEventListener(CART_OPEN_EVENT, handleOpenToggle)
    // Also listen for storage events (cross-tab sync)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
        window.removeEventListener(CART_UPDATED_EVENT, handleStorageChange)
        window.removeEventListener(CART_OPEN_EVENT, handleOpenToggle)
        window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Persist cart changes
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  }

  const addToCart = (product: Product, quantity: number = 1) => {
    const currentCart = [...cart]
    const existingIndex = currentCart.findIndex(item => item.id === product.id)
    
    let newCart
    if (existingIndex >= 0) {
        currentCart[existingIndex].quantity += quantity
        newCart = currentCart
    } else {
        newCart = [...currentCart, { ...product, quantity }]
    }
    
    updateCart(newCart)
    // Don't auto open cart
    // setIsOpenState(true)
  }

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId)
    updateCart(newCart)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    const newCart = cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    )
    updateCart(newCart)
  }

  const clearCart = () => {
    updateCart([])
  }

  const setIsOpenState = (open: boolean) => {
      setIsOpen(open)
      // Optional: dispatch event if we want to sync open state, 
      // but usually open state is local or global depending on UX.
      // Here we sync it so clicking 'add to cart' opens the drawer everywhere.
      window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT, { detail: open }))
  }

  return { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    isOpen,
    setIsOpen: setIsOpenState,
    isLoaded
  }
}
