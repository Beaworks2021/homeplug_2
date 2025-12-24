'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

interface ProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, isFavorite, onToggleFavorite, onAddToCart }: ProductCardProps) {
  // Use price directly as current selling price
  // If original_price exists and is greater than price, show discount

  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col h-full group">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <button 
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite?.(product.id)
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>
        {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                -{discountPercentage}%
            </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm text-gray-500 mb-1">{product.category || 'Uncategorized'}</p>
        <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{product.title}</h3>
        </Link>
        
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">₵{product.price.toFixed(2)}</span>
                {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">₵{product.original_price!.toFixed(2)}</span>
                )}
            </div>
          </div>
        </div>
        
        <Link 
            href={`/products/${product.id}`}
            className="mt-4 w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
            View Item
        </Link>
      </div>
    </div>
  )
}
