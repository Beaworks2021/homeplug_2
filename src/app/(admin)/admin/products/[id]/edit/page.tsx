import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const [productResponse, brandsResponse, categoriesResponse] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('brands').select('*').order('name'),
    supabase.from('categories').select('*').order('name')
  ])

  if (productResponse.error || !productResponse.data) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm 
        product={productResponse.data} 
        brands={brandsResponse.data || []} 
        categories={categoriesResponse.data || []} 
      />
    </div>
  )
}
