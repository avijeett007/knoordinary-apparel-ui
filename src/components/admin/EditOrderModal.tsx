import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, OrderItem, Product } from '@prisma/client';

interface ExtendedOrderItem extends OrderItem {
  product: Product;
}

interface ExtendedOrder extends Order {
  items: ExtendedOrderItem[];
}

interface EditOrderModalProps {
  order: ExtendedOrder;
  onClose: () => void;
  onSave: (order: ExtendedOrder) => void;
}

export default function EditOrderModal({ order, onClose, onSave }: EditOrderModalProps) {
  const [editedOrder, setEditedOrder] = useState<ExtendedOrder>(order);

  useEffect(() => {
    setEditedOrder(order);
  }, [order]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setEditedOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ),
      total: prev.items.reduce((sum, item) => 
        sum + (item.id === itemId ? newQuantity * item.price : item.quantity * item.price), 
        0
      )
    }));
  };

  const handleSizeChange = (itemId: string, newSize: string) => {
    setEditedOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, size: newSize }
          : item
      )
    }));
  };

  const handleShippingAddressChange = (field: string, value: string) => {
    setEditedOrder(prev => {
      try {
        const address = typeof prev.shippingAddress === 'string' 
          ? JSON.parse(prev.shippingAddress)
          : prev.shippingAddress;
        const newAddress = { ...address, [field]: value };
        return {
          ...prev,
          shippingAddress: JSON.stringify(newAddress)
        };
      } catch (err) {
        console.error('Error parsing shipping address:', err);
        return prev;
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate shipping address
      const address = typeof editedOrder.shippingAddress === 'string'
        ? JSON.parse(editedOrder.shippingAddress)
        : editedOrder.shippingAddress;

      // Ensure all required fields are present
      const requiredFields = ['name', 'street', 'city', 'state', 'zipCode', 'country'];
      const missingFields = requiredFields.filter(field => !address[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required shipping address fields: ${missingFields.join(', ')}`);
      }

      // Calculate total from items
      const total = editedOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      // Send the complete order
      onSave({
        ...editedOrder,
        total,
        shippingAddress: JSON.stringify(address)
      });
    } catch (err) {
      console.error('Error submitting order:', err);
      alert(err.message || 'Error updating order. Please check all fields.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Order ID</label>
                <input
                  type="text"
                  value={editedOrder.id}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={editedOrder.userId}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-4">
              {editedOrder.items.map((item) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{item.product.name}</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Size</label>
                      <select
                        value={item.size}
                        onChange={(e) => handleSizeChange(item.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={JSON.parse(editedOrder.shippingAddress).name}
                  onChange={(e) => handleShippingAddressChange('name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  value={JSON.parse(editedOrder.shippingAddress).street}
                  onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={JSON.parse(editedOrder.shippingAddress).city}
                  onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={JSON.parse(editedOrder.shippingAddress).state}
                  onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input
                  type="text"
                  value={JSON.parse(editedOrder.shippingAddress).zipCode}
                  onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={JSON.parse(editedOrder.shippingAddress).country}
                  onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Total</h3>
            <p className="text-lg font-medium">${editedOrder.total.toFixed(2)}</p>
          </div>

          <div className="mt-6 flex justify-end space-x-3 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
