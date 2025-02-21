import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import OrderTable from '@/components/admin/OrderTable';
import { motion } from 'framer-motion';

const AdminPage: NextPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchStatus, setSearchStatus] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      // Refresh orders
      fetchOrders();
    } catch (err) {
      setError('Failed to delete order');
      console.error('Error deleting order:', err);
    }
  };

  const handleUpdateOrder = async (order: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      // Refresh orders
      fetchOrders();
    } catch (err) {
      setError('Failed to update order');
      console.error('Error updating order:', err);
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesPhone = order.phoneNumber.includes(searchPhone);
    const matchesStatus = searchStatus === 'all' || order.status === searchStatus;
    return matchesPhone && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Admin Dashboard - Order Management</title>
        <meta name="description" content="Admin dashboard for managing orders" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Search by phone number"
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                  />
                  <select
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg">
                  <OrderTable
                    orders={filteredOrders}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteOrder={handleDeleteOrder}
                    onUpdateOrder={handleUpdateOrder}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
