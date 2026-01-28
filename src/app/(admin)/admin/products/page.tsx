import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Edit, Upload } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'
import Image from 'next/image'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*, brands(name)').order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-3">
          <Link 
            href="/admin/products/import" 
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </Link>
          <Link 
            href="/admin/products/new" 
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Image</th>
              <th className="text-left p-4 font-medium text-gray-500">Name</th>
              <th className="text-left p-4 font-medium text-gray-500">Brand</th>
              <th className="text-left p-4 font-medium text-gray-500">Price</th>
              <th className="text-left p-4 font-medium text-gray-500">Category</th>
              <th className="text-right p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products?.map((product) => (
              <tr key={product.id}>
                <td className="p-4">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden relative">
                    {product.image_url ? (
                        <Image src={product.image_url} alt="" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{product.title}</td>
                <td className="p-4 text-gray-500">{product.brands?.name || '-'}</td>
                <td className="p-4">₵{product.price}</td>
                <td className="p-4 text-gray-500">{product.category}</td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <DeleteProductButton id={product.id} />
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
