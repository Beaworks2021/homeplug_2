import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ProductActions } from '@/components/shop/ProductActions'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, brands(name)')
    .eq('id', id)
    .single()

  if (!product) {
    return notFound()
  }

  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col justify-center">
          <div className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
            {product.brands?.name || product.category || 'Product'}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{product.title}</h1>
          
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-3xl font-bold text-gray-900">₵{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through">
                ₵{product.original_price!.toFixed(2)}
              </span>
            )}
          </div>

          <div className="prose prose-gray mb-8 text-gray-600">
            <p>{product.description}</p>
          </div>

          <div className="border-t pt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
