import React, { useState } from 'react';
import { CartItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface ShoppingCartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemove: (productId: string, size: string) => void;
  total: number;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemove,
  total
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateMexicanPhoneNumber = (phone: string) => {
    // Mexican phone numbers are 10 digits and start with specific area codes
    const mexicanPhoneRegex = /^(?:(?:55|81|33|222|999)\d{8})$/;
    return mexicanPhoneRegex.test(phone.replace(/\D/g, ''));
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5, 8)}-${numbers.slice(8, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
    setPhoneError('');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!validateMexicanPhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid Mexican phone number (e.g., 55-1234-5678)');
      return;
    }

    try {
      const userId = uuidv4();
      const orderData = {
        userId,
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        total,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.selectedSize,
          price: item.price
        })),
        shippingAddress: JSON.stringify({
          name: 'Demo User',
          street: '123 Demo St',
          city: 'Demo City',
          state: 'DS',
          zipCode: '12345',
          country: 'Mexico'
        }),
        paymentDetails: JSON.stringify({
          paymentMethod: 'demo-card',
          paymentId: Math.random().toString(36).substr(2, 9)
        })
      };

      console.log('Submitting order:', JSON.stringify(orderData, null, 2));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order = await response.json();
      console.log('Order created:', order);
      
      // Store userId in localStorage for future use
      localStorage.setItem('userId', userId);
      
      // Clear cart and close
      items.forEach(item => onRemove(item.id, item.selectedSize));
      onClose();
      
      alert(`Order placed successfully! Your User ID is ${userId}. Please save this for future reference.`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.message || 'Failed to create order. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Your Cart</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map(item => (
                    <div
                      key={`${item.id}-${item.selectedSize}`}
                      className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <p className="text-gray-400">Size: {item.selectedSize}</p>
                        <p className="text-gray-400">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-bold">${total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400">
                      Mexican Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="55-1234-5678"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {phoneError && (
                      <p className="text-red-500 text-sm">{phoneError}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      Format: 55-1234-5678 (Mexico City), 81-1234-5678 (Monterrey), etc.
                    </p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;
