import React, { useState } from 'react';
import { Order, OrderItem, Product } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import EditOrderModal from './EditOrderModal';

interface ExtendedOrderItem extends OrderItem {
  product: Product;
}

interface ExtendedOrder extends Order {
  items: ExtendedOrderItem[];
}

interface OrderTableProps {
  orders: ExtendedOrder[];
  onUpdateStatus: (orderId: string, status: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrder: (order: ExtendedOrder) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function OrderTable({ orders, onUpdateStatus, onDeleteOrder, onUpdateOrder }: OrderTableProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<ExtendedOrder | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleStatusChange = (orderId: string, status: string) => {
    onUpdateStatus(orderId, status);
  };

  const handleSaveEdit = (updatedOrder: ExtendedOrder) => {
    onUpdateOrder(updatedOrder);
    setEditingOrder(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <motion.tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className={`text-sm rounded-full px-3 py-1 font-semibold ${statusColors[order.status as keyof typeof statusColors]}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingOrder(order);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this order?')) {
                          onDeleteOrder(order.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td colSpan={7} className="px-6 py-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Order Items:</h4>
                          <div className="grid grid-cols-3 gap-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="bg-white p-3 rounded shadow-sm">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-500">
                                  Size: {item.size} | Quantity: {item.quantity}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Price: ${item.price.toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Shipping Address:</h4>
                            <p className="text-sm text-gray-500">
                              {JSON.parse(order.shippingAddress).name}<br />
                              {JSON.parse(order.shippingAddress).street}<br />
                              {JSON.parse(order.shippingAddress).city}, {JSON.parse(order.shippingAddress).state} {JSON.parse(order.shippingAddress).zipCode}<br />
                              {JSON.parse(order.shippingAddress).country}
                            </p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editingOrder && (
          <EditOrderModal
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>
    </>
  );
}
