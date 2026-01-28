import Link from 'next/link'
import { BulkImportProducts } from '@/components/admin/BulkImportProducts'
import { ArrowLeft } from 'lucide-react'

export default function ImportProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Bulk Import Products</h1>
        <p className="text-gray-600 mt-2">
          Upload a CSV or Excel file to import multiple products at once.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">Expected file format:</p>
          <p className="text-sm text-blue-800">
            Required columns: <strong>title</strong>, <strong>price</strong>
          </p>
          <p className="text-sm text-blue-800">
            Optional columns: <strong>description</strong>, <strong>original_price</strong>, <strong>brand</strong>, <strong>category</strong>
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Note: Brands and categories will be created automatically if they don't exist.
          </p>
        </div>
      </div>
      <BulkImportProducts />
    </div>
  )
}
