import React, { useState } from 'react';
import { CartItem } from '../types';

interface CheckoutFormProps {
  items: CartItem[];
  onSubmit: (shippingDetails: any, paymentDetails: any) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ items, onSubmit }) => {
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(shippingDetails, paymentDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={shippingDetails.name}
            onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Street Address"
            value={shippingDetails.street}
            onChange={(e) => setShippingDetails({ ...shippingDetails, street: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={shippingDetails.city}
            onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={shippingDetails.state}
            onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={shippingDetails.zipCode}
            onChange={(e) => setShippingDetails({ ...shippingDetails, zipCode: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={shippingDetails.country}
            onChange={(e) => setShippingDetails({ ...shippingDetails, country: e.target.value })}
            className="border p-2 rounded"
            required
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Card Number"
            value={paymentDetails.cardNumber}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="MM/YY"
            value={paymentDetails.expiryDate}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="CVV"
            value={paymentDetails.cvv}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
            className="border p-2 rounded"
            required
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Place Order
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
