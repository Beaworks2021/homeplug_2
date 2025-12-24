import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [categoryResponse, productsResponse] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('products').select('*').eq('category_id', id)
  ])

  if (categoryResponse.error || !categoryResponse.data) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{categoryResponse.data.name}</h1>
      
      {productsResponse.data && productsResponse.data.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {productsResponse.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">No products found in this category.</p>
      )}
    </div>
  )
}
