import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BrandPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [brandResponse, productsResponse] = await Promise.all([
    supabase.from('brands').select('*').eq('id', id).single(),
    supabase.from('products').select('*').eq('brand_id', id)
  ])

  if (brandResponse.error || !brandResponse.data) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{brandResponse.data.name}</h1>
      
      {productsResponse.data && productsResponse.data.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {productsResponse.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">No products found for this brand.</p>
      )}
    </div>
  )
}
