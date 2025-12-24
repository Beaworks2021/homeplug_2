'use client'

import { Database } from '@/lib/types/database'
import { ProductCard } from './ProductCard'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useCart } from '@/lib/hooks/useCart'

type Product = Database['public']['Tables']['products']['Row']

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { favorites, toggleFavorite, isLoaded } = useFavorites()
  const { addToCart } = useCart()

  if (!isLoaded) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
            <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
    </div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favorites.includes(product.id)}
          onToggleFavorite={toggleFavorite}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  )
}
