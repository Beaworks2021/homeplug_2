import { createClient } from '@/lib/supabase/server'
import { CarouselManager } from '@/components/admin/CarouselManager'

export default async function AdminCarouselPage() {
  const supabase = await createClient()
  const { data: slides } = await supabase
    .from('carousel_slides')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hero Carousel</h1>
      <CarouselManager initialSlides={slides || []} />
    </div>
  )
}
