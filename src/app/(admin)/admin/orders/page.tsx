import { createClient } from '@/lib/supabase/server'
import { OrderStatusToggle } from '@/components/admin/OrderStatusToggle'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Order ID</th>
              <th className="text-left p-4 font-medium text-gray-500">Customer</th>
              <th className="text-left p-4 font-medium text-gray-500">Total</th>
              <th className="text-left p-4 font-medium text-gray-500">Status</th>
              <th className="text-left p-4 font-medium text-gray-500">Date</th>
              <th className="text-right p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders?.map((order) => (
              <tr key={order.id}>
                <td className="p-4 font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</td>
                <td className="p-4">
                  <div className="font-medium">{order.full_name}</div>
                  <div className="text-sm text-gray-500">{order.email}</div>
                </td>
                <td className="p-4 font-medium">₵{order.total_amount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                   <OrderStatusToggle orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
