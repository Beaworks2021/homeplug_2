'use client'

import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    await supabase.from('products').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 rounded">
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
