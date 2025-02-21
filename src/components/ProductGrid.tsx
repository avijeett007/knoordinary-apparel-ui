import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '../types';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, size: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id];
    if (!size) {
      setSelectedProduct(product.id);
      return;
    }
    onAddToCart(product, size);
    setSelectedSizes(prev => ({ ...prev, [product.id]: '' }));
    setSelectedProduct(null);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No products available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {products.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative h-64 w-full bg-gray-100 p-4">
            <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="contain"
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500">{product.stock} in stock</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes)).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(product.id, size)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                        ${selectedSizes[product.id] === size
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedProduct === product.id && !selectedSizes[product.id] && (
                  <p className="text-red-500 text-sm mt-2">Please select a size</p>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
