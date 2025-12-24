import { createClient } from '@/lib/supabase/client'

export async function getNavigation() {
  const supabase = createClient()
  
  const [brands, categories] = await Promise.all([
    supabase.from('brands').select('id, name').order('name'),
    supabase.from('categories').select('id, name, slug').order('name')
  ])

  return {
    brands: brands.data || [],
    categories: categories.data || []
  }
}
