import { createClient } from '@/lib/supabase/server'
import { BrandsManager } from '@/components/admin/BrandsManager'

export default async function AdminBrandsPage() {
  const supabase = await createClient()
  const { data: brands } = await supabase.from('brands').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Brands</h1>
      <BrandsManager initialBrands={brands || []} />
    </div>
  )
}
