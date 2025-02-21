import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Inter } from "next/font/google";
import Head from "next/head";
import { useCallback, useState, useEffect } from "react";
import Image from 'next/image';

import Playground from "@/components/playground/Playground";
import { ConfigProvider } from "@/hooks/useConfig";
import { ConnectionProvider } from "@/hooks/useConnection";
import { ToastProvider } from "@/components/toast/ToasterProvider";
import ProductGrid from "@/components/ProductGrid";
import ShoppingCart from "@/components/ShoppingCart";
import { CartItem, Product } from "@/types";
import CustomerServiceWidget from '../components/CustomerServiceWidget';
import { products as initialProducts } from '../data/products';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [products] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product: Product, size: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === product.id && item.selectedSize === size
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: 1, selectedSize: size }];
    });

    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.id === productId && item.selectedSize === size)
      )
    );
  };

  const handleUpdateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveFromCart(productId, size);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <ConfigProvider>
      <ConnectionProvider>
        <ToastProvider>
          <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
            <Head>
              <title>Kno Ordinary Apparel</title>
              <meta name="description" content="Premium clothing store with live customer service" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Kno Ordinary Apparel</h1>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
              />
            </main>

            <AnimatePresence>
              {isCartOpen && (
                <ShoppingCart
                  items={cartItems}
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveFromCart}
                  total={cartTotal}
                />
              )}
            </AnimatePresence>

            <CustomerServiceWidget />
          </div>
        </ToastProvider>
      </ConnectionProvider>
    </ConfigProvider>
  );
}