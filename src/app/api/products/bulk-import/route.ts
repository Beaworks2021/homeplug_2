import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface ProductImportRow {
  title: string
  description?: string
  price: number
  original_price?: number
  brand?: string
  category?: string
}

interface ImportResult {
  success: boolean
  row: number
  product?: any
  error?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products }: { products: ProductImportRow[] } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    // Fetch existing brands and categories for lookup
    const [brandsResult, categoriesResult] = await Promise.all([
      supabase.from('brands').select('id, name'),
      supabase.from('categories').select('id, name')
    ])

    const existingBrands = new Map(
      (brandsResult.data || []).map(b => [b.name.toLowerCase(), b.id])
    )
    const existingCategories = new Map(
      (categoriesResult.data || []).map(c => [c.name.toLowerCase(), c.id])
    )

    const results: ImportResult[] = []
    const brandsToCreate = new Set<string>()
    const categoriesToCreate = new Set<string>()

    // First pass: validate and collect brands/categories to create
    products.forEach((product, index) => {
      const row = index + 2 // +2 because row 1 is header, index is 0-based
      
      // Validate required fields
      if (!product.title || product.title.trim() === '') {
        results.push({
          success: false,
          row,
          error: 'Title is required'
        })
        return
      }

      if (!product.price || isNaN(Number(product.price)) || Number(product.price) <= 0) {
        results.push({
          success: false,
          row,
          error: 'Valid price is required'
        })
        return
      }

      if (product.original_price && (isNaN(Number(product.original_price)) || Number(product.original_price) <= Number(product.price))) {
        results.push({
          success: false,
          row,
          error: 'Original price must be greater than price if provided'
        })
        return
      }

      // Collect brands and categories to create
      if (product.brand && product.brand.trim() && !existingBrands.has(product.brand.toLowerCase())) {
        brandsToCreate.add(product.brand.trim())
      }

      if (product.category && product.category.trim() && !existingCategories.has(product.category.toLowerCase())) {
        categoriesToCreate.add(product.category.trim())
      }
    })

    // Create missing brands
    if (brandsToCreate.size > 0) {
      const brandInserts = Array.from(brandsToCreate).map(name => ({ name }))
      const { data: newBrands, error: brandError } = await supabase
        .from('brands')
        .insert(brandInserts)
        .select('id, name')

      if (brandError) {
        return NextResponse.json({ error: `Failed to create brands: ${brandError.message}` }, { status: 500 })
      }

      // Add new brands to the map
      newBrands?.forEach(b => existingBrands.set(b.name.toLowerCase(), b.id))
    }

    // Create missing categories
    if (categoriesToCreate.size > 0) {
      const categoryInserts = Array.from(categoriesToCreate).map(name => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }))
      const { data: newCategories, error: categoryError } = await supabase
        .from('categories')
        .insert(categoryInserts)
        .select('id, name')

      if (categoryError) {
        return NextResponse.json({ error: `Failed to create categories: ${categoryError.message}` }, { status: 500 })
      }

      // Add new categories to the map
      newCategories?.forEach(c => existingCategories.set(c.name.toLowerCase(), c.id))
    }

    // Second pass: insert products
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const row = i + 2

      // Skip if already marked as failed in validation
      if (results.find(r => r.row === row && !r.success)) {
        continue
      }

      try {
        const brandId = product.brand && product.brand.trim()
          ? existingBrands.get(product.brand.toLowerCase()) || null
          : null

        const categoryId = product.category && product.category.trim()
          ? existingCategories.get(product.category.toLowerCase()) || null
          : null

        const categoryName = product.category && product.category.trim() || null

        const productData = {
          title: product.title.trim(),
          description: product.description?.trim() || null,
          price: Number(product.price),
          original_price: product.original_price ? Number(product.original_price) : null,
          brand_id: brandId,
          category_id: categoryId,
          category: categoryName, // Keep legacy field
          image_url: null
        }

        const { data: insertedProduct, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (insertError) {
          results.push({
            success: false,
            row,
            error: insertError.message
          })
        } else {
          results.push({
            success: true,
            row,
            product: insertedProduct
          })
        }
      } catch (error: any) {
        results.push({
          success: false,
          row,
          error: error.message || 'Unknown error'
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        total: products.length,
        successful,
        failed
      },
      results
    })

  } catch (error: any) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
