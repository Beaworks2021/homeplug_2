'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, FileText, CheckCircle2, XCircle, Loader2, X, Maximize2 } from 'lucide-react'
import Papa from 'papaparse'

interface ProductRow {
  title: string
  description?: string
  price: number | string
  original_price?: number | string
  brand?: string
  category?: string
}

interface ValidationError {
  row: number
  field?: string
  message: string
}

interface ImportResult {
  success: boolean
  row: number
  product?: any
  error?: string
}

interface ImportSummary {
  total: number
  successful: number
  failed: number
}

export function BulkImportProducts() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sheets, setSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isLoadingSheets, setIsLoadingSheets] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [showModal, setShowModal] = useState(false)

  const parseFile = async (file: File) => {
    setIsParsing(true)
    setErrors([])
    setProducts([])
    setImportResults([])
    setSummary(null)

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let parsedProducts: ProductRow[] = []

      if (fileExtension === 'csv') {
        // Parse CSV using PapaParse
        const text = await file.text()
        
        await new Promise<void>((resolve, reject) => {
          Papa.parse<any>(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              try {
                const data = results.data as any[]
                parsedProducts = data.map((row) => {
                  const product: ProductRow = {
                    title: (row.title || '').toString().trim(),
                    description: row.description ? row.description.toString().trim() : undefined,
                    price: row.price ? row.price.toString().trim() : '',
                    original_price: row.original_price ? row.original_price.toString().trim() : undefined,
                    brand: row.brand ? row.brand.toString().trim() : undefined,
                    category: row.category ? row.category.toString().trim() : undefined,
                  }
                  return product
                })

                // Validate headers
                if (parsedProducts.length === 0) {
                  reject(new Error('No products found in file'))
                  return
                }

                // Check if required columns exist
                const firstProduct = parsedProducts[0]
                if (!firstProduct.title && !firstProduct.hasOwnProperty('title')) {
                  reject(new Error('Missing required column: title'))
                  return
                }
                if (!firstProduct.price && !firstProduct.hasOwnProperty('price')) {
                  reject(new Error('Missing required column: price'))
                  return
                }

                // Validate each row
                const validationErrors: ValidationError[] = []
                parsedProducts.forEach((product, index) => {
                  const rowNumber = index + 2 // +2 because row 1 is header, index is 0-based

                  if (!product.title || product.title.toString().trim() === '') {
                    validationErrors.push({
                      row: rowNumber,
                      field: 'title',
                      message: 'Title is required'
                    })
                  }

                  if (!product.price || isNaN(Number(product.price)) || Number(product.price) <= 0) {
                    validationErrors.push({
                      row: rowNumber,
                      field: 'price',
                      message: 'Valid price is required'
                    })
                  }

                  if (product.original_price && (isNaN(Number(product.original_price)) || Number(product.original_price) <= Number(product.price))) {
                    validationErrors.push({
                      row: rowNumber,
                      field: 'original_price',
                      message: 'Original price must be greater than price if provided'
                    })
                  }
                })

                setProducts(parsedProducts)
                setErrors(validationErrors)
                resolve()
              } catch (error: any) {
                reject(error)
              }
            },
            error: (err: unknown) => {
              const message =
                (err && (err as any).message) || 'Unknown CSV parsing error'
              reject(new Error(`CSV parsing error: ${message}`))
            }
          })
        })

      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel on server
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/products/parse-excel', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to parse Excel file')
        }

        const data = await response.json()
        parsedProducts = data.products || []

        if (parsedProducts.length === 0) {
          throw new Error('No products found in file. Please check that your file has data rows.')
        }

        // Validate each row for Excel
        const validationErrors: ValidationError[] = []
        parsedProducts.forEach((product, index) => {
          const rowNumber = index + 2 // +2 because row 1 is header, index is 0-based

          if (!product.title || product.title.toString().trim() === '') {
            validationErrors.push({
              row: rowNumber,
              field: 'title',
              message: 'Title is required'
            })
          }

          if (!product.price || isNaN(Number(product.price)) || Number(product.price) <= 0) {
            validationErrors.push({
              row: rowNumber,
              field: 'price',
              message: 'Valid price is required'
            })
          }

          if (product.original_price && (isNaN(Number(product.original_price)) || Number(product.original_price) <= Number(product.price))) {
            validationErrors.push({
              row: rowNumber,
              field: 'original_price',
              message: 'Original price must be greater than price if provided'
            })
          }
        })

        setProducts(parsedProducts)
        setErrors(validationErrors)
        
        console.log('Parsed products:', parsedProducts.length, parsedProducts)
        console.log('Validation errors:', validationErrors.length)

      } else {
        throw new Error('Unsupported file type. Please upload CSV or Excel files.')
      }

    } catch (error: any) {
      console.error('Parse error:', error)
      setErrors([{
        row: 0,
        message: error.message || 'Failed to parse file'
      }])
      setProducts([]) // Ensure products is empty on error
    } finally {
      setIsParsing(false)
    }
  }

  const loadSheets = async (file: File) => {
    setIsLoadingSheets(true)
    setErrors([])
    setSheets([])
    setSelectedSheet(null)
    setProducts([])
    setHeaders([])

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sheetName', 'list')

      const response = await fetch('/api/products/parse-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to load sheets')
      }

      const data = await response.json()
      setSheets(data.sheets || [])
      
      // Auto-select first sheet if available
      if (data.sheets && data.sheets.length > 0) {
        setSelectedSheet(data.sheets[0])
        await parseSheet(file, data.sheets[0])
      }
    } catch (error: any) {
      setErrors([{
        row: 0,
        message: error.message || 'Failed to load sheets'
      }])
    } finally {
      setIsLoadingSheets(false)
    }
  }

  const parseSheet = async (file: File, sheetName: string) => {
    setIsParsing(true)
    setErrors([])
    setProducts([])
    setHeaders([])
    setImportResults([])
    setSummary(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sheetName', sheetName)

      const response = await fetch('/api/products/parse-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to parse sheet')
      }

      const data = await response.json()
      const parsedData = data.products || []

      if (parsedData.length === 0) {
        throw new Error('No data found in sheet')
      }

      // Extract headers from first row
      const firstRow = parsedData[0]
      const extractedHeaders = Object.keys(firstRow)
      setHeaders(extractedHeaders)
      setProducts(parsedData)

    } catch (error: any) {
      setErrors([{
        row: 0,
        message: error.message || 'Failed to parse sheet'
      }])
    } finally {
      setIsParsing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        await loadSheets(selectedFile)
      } else {
        // CSV - parse directly
        await parseFile(selectedFile)
      }
    }
  }

  const handleSheetChange = async (sheetName: string) => {
    if (file) {
      setSelectedSheet(sheetName)
      await parseSheet(file, sheetName)
    }
  }

  const handleImport = async () => {
    if (products.length === 0 || errors.length > 0) {
      return
    }

    setIsImporting(true)
    setImportResults([])
    setSummary(null)

    try {
      // Map raw spreadsheet rows to the shape expected by the bulk-import API
      const mappedProducts = products.map((row) => {
        // Title: prefer explicit title, then Item
        const title =
          (row.title ?? row.Title ?? row.Item ?? '').toString().trim()

        // Price: prefer explicit price, then Retail, strip commas
        const rawPrice =
          row.price ??
          row.Price ??
          row.Retail ??
          row.retail ??
          ''
        const price = Number(
          rawPrice.toString().replace(/,/g, '').trim() || NaN
        )

        // Description: prefer description, then Specifications, then Model
        const description =
          (row.description ??
            row.Description ??
            row.Specifications ??
            row.Specification ??
            row.Model ??
            '')
            .toString()
            .trim() || null

        // Category: map Category column directly
        const category =
          (row.category ?? row.Category ?? '').toString().trim() || null

        // Brand: try Brand column if present, otherwise null
        const brand =
          (row.brand ?? row.Brand ?? '').toString().trim() || null

        return {
          title,
          price,
          original_price: null,
          brand,
          category,
          description,
        }
      })

      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products: mappedProducts })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setImportResults(data.results || [])
      setSummary(data.summary || null)

      // Refresh products page after successful import
      if (data.summary && data.summary.successful > 0) {
        setTimeout(() => {
          router.push('/admin/products')
          router.refresh()
        }, 2000)
      }

    } catch (error: any) {
      setErrors([{
        row: 0,
        message: error.message || 'Failed to import products'
      }])
    } finally {
      setIsImporting(false)
    }
  }

  const hasRowError = (rowNumber: number) => {
    return errors.some(e => e.row === rowNumber) || 
           importResults.some(r => r.row === rowNumber && !r.success)
  }

  const getRowError = (rowNumber: number) => {
    const error = errors.find(e => e.row === rowNumber)
    if (error) return error.message
    const result = importResults.find(r => r.row === rowNumber && !r.success)
    return result?.error
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Upload File</h2>
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isParsing || isImporting}
            />
            <div className="flex flex-col items-center">
              {isParsing ? (
                <Loader2 className="w-12 h-12 text-gray-400 mb-4 animate-spin" />
              ) : file ? (
                <FileSpreadsheet className="w-12 h-12 text-green-500 mb-4" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
              )}
              <p className="text-gray-600 mb-2">
                {isParsing
                  ? 'Parsing file...'
                  : file
                  ? file.name
                  : 'Click to upload CSV or Excel file'}
              </p>
              <p className="text-sm text-gray-400">
                Supported formats: CSV, XLSX, XLS
              </p>
            </div>
          </div>

          {file && !isParsing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{file.name}</span>
              <button
                onClick={() => {
                  setFile(null)
                  setSheets([])
                  setSelectedSheet(null)
                  setProducts([])
                  setHeaders([])
                  setErrors([])
                  setImportResults([])
                  setSummary(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-red-600 hover:text-red-700 ml-2"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sheet Selection (for Excel files) */}
      {sheets.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Select Sheet</h2>
          <div className="flex flex-wrap gap-2">
            {sheets.map((sheet) => (
              <button
                key={sheet}
                onClick={() => handleSheetChange(sheet)}
                disabled={isParsing}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedSheet === sheet
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sheet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Sheets */}
      {isLoadingSheets && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading sheets...</p>
        </div>
      )}

      {/* Error Display */}
      {errors.length > 0 && errors[0].row === 0 && !isParsing && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error parsing file</p>
          <p className="text-sm text-red-600 mt-1">{errors[0].message}</p>
        </div>
      )}

      {/* No Products Message */}
      {!isParsing && file && products.length === 0 && errors.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">No products found</p>
          <p className="text-sm text-yellow-600 mt-1">
            The file was parsed successfully but no products were found. Please check your file format.
          </p>
        </div>
      )}

      {/* Preview Table */}
      {products.length > 0 && headers.length > 0 && !isParsing && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Preview ({products.length} rows)
            </h2>
            <div className="flex items-center gap-4">
              {summary && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">
                    ✓ {summary.successful} successful
                  </span>
                  {summary.failed > 0 && (
                    <span className="text-red-600">
                      ✗ {summary.failed} failed
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                View Full Screen
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 sticky left-0 bg-gray-50 z-20 min-w-[60px]">Row</th>
                  {headers.map((header, idx) => (
                    <th key={idx} className="text-left p-3 text-sm font-medium text-gray-500 min-w-[150px] max-w-[300px]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((row, index) => {
                  const rowNumber = index + 2
                  const hasError = hasRowError(rowNumber)
                  const errorMessage = getRowError(rowNumber)
                  const isSuccess = importResults.some(r => r.row === rowNumber && r.success)

                  return (
                    <tr
                      key={index}
                      className={hasError ? 'bg-red-50' : isSuccess ? 'bg-green-50' : ''}
                    >
                      <td className="p-3 text-sm text-gray-500 sticky left-0 bg-inherit z-10 font-medium min-w-[60px]">
                        {rowNumber}
                      </td>
                      {headers.map((header, idx) => (
                        <td key={idx} className="p-3 text-sm break-words max-w-[300px]">
                          <div className="line-clamp-3" title={row[header] || '-'}>
                            {row[header] || '-'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Screen Modal */}
      {showModal && products.length > 0 && headers.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold">
                Preview ({products.length} rows)
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="overflow-x-auto h-full">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-500 sticky left-0 bg-gray-50 z-20 min-w-[60px]">Row</th>
                      {headers.map((header, idx) => (
                        <th key={idx} className="text-left p-3 text-sm font-medium text-gray-500 min-w-[150px] max-w-[300px]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((row, index) => {
                      const rowNumber = index + 2
                      const hasError = hasRowError(rowNumber)
                      const isSuccess = importResults.some(r => r.row === rowNumber && r.success)

                      return (
                        <tr
                          key={index}
                          className={hasError ? 'bg-red-50' : isSuccess ? 'bg-green-50' : ''}
                        >
                          <td className="p-3 text-sm text-gray-500 sticky left-0 bg-inherit z-10 font-medium min-w-[60px]">
                            {rowNumber}
                          </td>
                          {headers.map((header, idx) => (
                            <td key={idx} className="p-3 text-sm break-words max-w-[300px]">
                              <div className="whitespace-normal">
                                {row[header] || '-'}
                              </div>
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Button */}
      {products.length > 0 && errors.length === 0 && !summary && (
        <div className="flex justify-end gap-4">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import {products.length} Products
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Message */}
      {summary && summary.successful > 0 && summary.failed === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✓ Successfully imported {summary.successful} products! Redirecting...
          </p>
        </div>
      )}
    </div>
  )
}
