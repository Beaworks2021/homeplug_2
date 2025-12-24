'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit } from 'lucide-react'

export function BrandsManager({ initialBrands }: { initialBrands: any[] }) {
  const [brands, setBrands] = useState(initialBrands)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newBrandName, setNewBrandName] = useState('')
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrandName.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('brands')
      .insert({ name: newBrandName })
      .select()
      .single()

    if (!error && data) {
      setBrands([data, ...brands])
      setNewBrandName('')
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand? Products associated with it will lose their brand.')) return

    const { error } = await supabase.from('brands').delete().eq('id', id)
    if (!error) {
      setBrands(brands.filter(b => b.id !== id))
      router.refresh()
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    const { error } = await supabase
        .from('brands')
        .update({ name: editName })
        .eq('id', id)
    
    if (!error) {
        setBrands(brands.map(b => b.id === id ? { ...b, name: editName } : b))
        setIsEditing(null)
        router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      {/* Add New Brand */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Add New Brand</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="Brand Name"
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* List Brands */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Name</th>
              <th className="text-right p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td className="p-4">
                  {isEditing === brand.id ? (
                    <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="p-1 border rounded w-full max-w-xs"
                    />
                  ) : (
                    <span className="font-medium">{brand.name}</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  {isEditing === brand.id ? (
                    <>
                        <button 
                            onClick={() => handleUpdate(brand.id)}
                            className="text-green-600 hover:underline text-sm mr-2"
                        >
                            Save
                        </button>
                        <button 
                            onClick={() => setIsEditing(null)}
                            className="text-gray-500 hover:underline text-sm"
                        >
                            Cancel
                        </button>
                    </>
                  ) : (
                    <>
                        <button 
                            onClick={() => {
                                setIsEditing(brand.id)
                                setEditName(brand.name)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(brand.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-gray-500">No brands found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
