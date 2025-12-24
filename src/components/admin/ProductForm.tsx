'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

type Product = Database['public']['Tables']['products']['Row']
type Brand = Database['public']['Tables']['brands']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface ProductFormProps {
  product?: Product
  brands: Brand[]
  categories: Category[]
}

export function ProductForm({ product, brands, categories }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(product?.image_url || '')
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const productData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
      brand_id: formData.get('brand_id') as string || null,
      category_id: formData.get('category_id') as string || null,
      // Keep legacy category field for now, populated by selected category name
      category: categories.find(c => c.id === formData.get('category_id'))?.name || null,
      image_url: imageUrl,
    }

    try {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)
        if (error) throw error
      }
      
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Title</label>
          <input
            name="title"
            defaultValue={product?.title}
            required
            className="w-full p-2 border rounded-lg"
            placeholder="e.g. Wireless Headphones"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={product?.description || ''}
            rows={4}
            className="w-full p-2 border rounded-lg"
            placeholder="Product details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Price (₵)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product?.price}
              required
              className="w-full p-2 border rounded-lg"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Original Price (₵) <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              name="original_price"
              type="number"
              step="0.01"
              defaultValue={product?.original_price || ''}
              className="w-full p-2 border rounded-lg"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <select
              name="brand_id"
              defaultValue={product?.brand_id || ''}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category_id"
              defaultValue={product?.category_id || ''}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Image</label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                            {uploading ? 'Uploading...' : 'Click to upload image'}
                        </span>
                    </div>
                </div>
                <div className="mt-2">
                    <span className="text-xs text-gray-500 uppercase font-bold mr-2">OR</span>
                    <input 
                        type="url" 
                        placeholder="Enter Image URL directly"
                        value={imageUrl || ''}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm mt-1"
                    />
                </div>
            </div>
            
            {imageUrl && (
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  )
}
