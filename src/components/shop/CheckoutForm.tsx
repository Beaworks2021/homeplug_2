'use client'

import { useState } from 'react'
import { useCart } from '@/lib/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CheckoutForm() {
  const { cart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const orderData = {
        full_name: formData.get('full_name') as string,
        email: formData.get('email') as string,
        phone_number: formData.get('phone_number') as string,
        residential_address: formData.get('residential_address') as string,
        total_amount: total,
        status: 'Pending' as const
    }

    try {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single()

        if (orderError) throw orderError

        const orderItems = cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) throw itemsError

        clearCart()
        router.push('/checkout/success')
    } catch (error) {
        console.error('Checkout error:', error)
        alert('Failed to place order. Please try again.')
    } finally {
        setLoading(false)
    }
  }

  if (cart.length === 0) {
      return (
          <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">
                  Go back to shop
              </button>
          </div>
      )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <div>
            <h2 className="text-xl font-bold mb-6">Contact Information</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input required name="full_name" type="text" className="w-full p-2 border rounded-lg" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input required name="email" type="email" className="w-full p-2 border rounded-lg" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input required name="phone_number" type="tel" className="w-full p-2 border rounded-lg" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Residential Address</label>
                    <textarea required name="residential_address" rows={3} className="w-full p-2 border rounded-lg" placeholder="123 Main St, City, Country"></textarea>
                </div>
            </form>
        </div>

        <div>
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.title} x {item.quantity}</span>
                        <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₵{total.toFixed(2)}</span>
                </div>
                <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Place Order'}
                </button>
            </div>
        </div>
    </div>
  )
}
