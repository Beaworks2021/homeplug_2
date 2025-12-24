import { createClient } from '@/lib/supabase/server'
import { CategoriesManager } from '@/components/admin/CategoriesManager'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <CategoriesManager initialCategories={categories || []} />
    </div>
  )
}
