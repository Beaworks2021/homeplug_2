'use client'

import { useState } from 'react'
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

export function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { favorites, toggleFavorite } = useFavorites()
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const isFavorite = favorites.includes(product.id)

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart(product, quantity)
    setTimeout(() => setIsAdding(false), 500)
  }

  const decrement = () => setQuantity(prev => Math.max(1, prev - 1))
  const increment = () => setQuantity(prev => prev + 1)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-900">Quantity</span>
        <div className="flex items-center border rounded-lg">
          <button 
            onClick={decrement}
            className="p-3 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button 
            onClick={increment}
            className="p-3 hover:bg-gray-50 text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex-1 bg-black text-white h-12 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-90 disabled:scale-95 transform duration-100"
        >
          <ShoppingCart className="w-5 h-5" />
          {isAdding ? 'Added!' : 'Add to Cart'}
        </button>
        
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-colors ${
            isFavorite 
              ? 'border-red-200 bg-red-50 text-red-500' 
              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}
