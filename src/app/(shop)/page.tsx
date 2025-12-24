import { createClient } from '@/lib/supabase/server'
import { HeroCarousel } from '@/components/shop/HeroCarousel'
import { ProductGrid } from '@/components/shop/ProductGrid'

export default async function ShopPage() {
  const supabase = await createClient()
  
  const { data: products } = await supabase.from('products').select('*')
  const { data: slides } = await supabase.from('carousel_slides').select('*').eq('is_active', true).order('sort_order')

  return (
    <div className="flex flex-col min-h-screen">
      <HeroCarousel slides={slides || []} />
      
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        <ProductGrid products={products || []} />
      </div>
    </div>
  )
}
