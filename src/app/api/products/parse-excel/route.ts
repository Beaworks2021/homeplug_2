import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const sheetName = formData.get('sheetName') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)

    // If sheetName is provided, use it; otherwise get all sheet names
    if (sheetName === 'list') {
      const sheetNames = workbook.worksheets.map(ws => ws.name)
      return NextResponse.json({ sheets: sheetNames })
    }

    // Get the selected worksheet
    const worksheet = sheetName 
      ? workbook.getWorksheet(sheetName) 
      : workbook.worksheets[0]
    
    if (!worksheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 400 })
    }

    // Get headers from first row - read all columns
    const headerRow = worksheet.getRow(1)
    const headers: string[] = []
    
    // Find the actual number of columns with data
    let maxColumn = 0
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      maxColumn = Math.max(maxColumn, colNumber)
    })
    
    // Read all cells in header row
    for (let colNumber = 1; colNumber <= maxColumn; colNumber++) {
      const cell = headerRow.getCell(colNumber)
      
      // Use ExcelJS's text property which gives formatted text value
      let headerValue = ''
      try {
        headerValue = cell.text || ''
        
        // If text is empty but value exists, try to convert value
        if (!headerValue && cell.value !== null && cell.value !== undefined) {
          const cellValue = cell.value
          if (typeof cellValue === 'object' && cellValue instanceof Date) {
            headerValue = cellValue.toISOString().split('T')[0]
          } else {
            headerValue = String(cellValue)
          }
        }
      } catch (error) {
        // Fallback
        try {
          headerValue = String(cell.value || '')
        } catch {
          headerValue = ''
        }
      }
      
      headers[colNumber - 1] = headerValue.trim() || `Column ${colNumber}`
    }
    
    console.log('Headers found:', headers)

    // Parse data rows - just return raw data
    const products: any[] = []
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Skip header row

      const rowData: any = {}
      let hasData = false
      
      // Initialize all columns with empty values
      headers.forEach((header, idx) => {
        rowData[header] = ''
      })
      
      // Read all cells in the row - use eachCell to safely iterate
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colNumber > headers.length) return // Skip columns beyond headers
        
        const headerName = headers[colNumber - 1] || `Column ${colNumber}`
        
        // Use ExcelJS's text property which gives formatted text value
        // This handles all cell types (text, numbers, formulas, dates, etc.)
        let value = ''
        try {
          // Get the text representation of the cell
          value = cell.text || ''
          
          // If text is empty but value exists, try to convert value
          if (!value && cell.value !== null && cell.value !== undefined) {
            const cellValue = cell.value
            if (typeof cellValue === 'object') {
              // For date objects, format them
              if (cellValue instanceof Date) {
                value = cellValue.toISOString().split('T')[0] // YYYY-MM-DD format
              } else if ('result' in cellValue) {
                // Formula result
                value = String(cellValue.result || '')
              } else {
                // Try to get a meaningful string representation
                value = String(cellValue)
              }
            } else {
              value = String(cellValue)
            }
          }
        } catch (error) {
          // Fallback: try to get value directly
          try {
            if (cell.value !== undefined) {
              value = String(cell.value || '')
            }
          } catch {
            value = ''
          }
        }
        
        rowData[headerName] = value.trim()
        if (value.trim()) hasData = true
      })

      // Only add row if it has any data
      if (hasData) {
        products.push(rowData)
      }
    })
    
    console.log('Products parsed:', products.length)

    return NextResponse.json({ products })

  } catch (error: any) {
    console.error('Excel parsing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to parse Excel file' },
      { status: 500 }
    )
  }
}
