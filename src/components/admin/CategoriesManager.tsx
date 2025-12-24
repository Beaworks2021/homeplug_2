'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit } from 'lucide-react'

export function CategoriesManager({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setLoading(true)
    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCategoryName, slug })
      .select()
      .single()

    if (!error && data) {
      setCategories([data, ...categories])
      setNewCategoryName('')
      router.refresh()
    } else if (error) {
        alert(error.message)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
      router.refresh()
    } else {
        alert('Failed to delete. It might be in use.')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const { error } = await supabase
        .from('categories')
        .update({ name: editName, slug })
        .eq('id', id)
    
    if (!error) {
        setCategories(categories.map(c => c.id === id ? { ...c, name: editName, slug } : c))
        setIsEditing(null)
        router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      {/* Add New Category */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category Name"
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

      {/* List Categories */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Name</th>
              <th className="text-left p-4 font-medium text-gray-500">Slug</th>
              <th className="text-right p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="p-4">
                  {isEditing === category.id ? (
                    <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="p-1 border rounded w-full max-w-xs"
                    />
                  ) : (
                    <span className="font-medium">{category.name}</span>
                  )}
                </td>
                <td className="p-4 text-gray-500">{category.slug}</td>
                <td className="p-4 text-right space-x-2">
                  {isEditing === category.id ? (
                    <>
                        <button 
                            onClick={() => handleUpdate(category.id)}
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
                                setIsEditing(category.id)
                                setEditName(category.name)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
