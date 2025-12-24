import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Thank you for your purchase. We have received your order and will contact you shortly.
      </p>
      <Link 
        href="/"
        className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
