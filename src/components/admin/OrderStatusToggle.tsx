'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, X, Clock } from 'lucide-react'

interface OrderStatusToggleProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusToggle({ orderId, currentStatus }: OrderStatusToggleProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleStatusChange = async (newStatus: 'Pending' | 'Approved' | 'Cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  if (currentStatus === 'Cancelled') {
      return <span className="text-red-600 font-medium">Cancelled</span>
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus === 'Pending' ? (
        <button
          onClick={() => handleStatusChange('Approved')}
          className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
        >
          <Check className="w-3 h-3" /> Approve
        </button>
      ) : (
        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
           <Check className="w-3 h-3" /> Approved
        </span>
      )}
      
      {currentStatus !== 'Cancelled' && (
          <button
            onClick={() => handleStatusChange('Cancelled')}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Cancel Order"
          >
            <X className="w-4 h-4" />
          </button>
      )}
    </div>
  )
}
