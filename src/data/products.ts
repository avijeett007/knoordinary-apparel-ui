import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Indigo T-Shirt',
    description: 'Premium cotton t-shirt with a modern fit',
    price: 29.99,
    image: '/images/tshirt.svg',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100
  },
  {
    id: '2',
    name: 'Eco Hoodie',
    description: 'Sustainable cotton blend hoodie, perfect for any weather',
    price: 59.99,
    image: '/images/hoodie.svg',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 75
  },
  {
    id: '3',
    name: 'Urban Cargo Pants',
    description: 'Stylish cargo pants with multiple pockets',
    price: 79.99,
    image: '/images/pants.svg',
    category: 'Pants',
    sizes: ['30', '32', '34', '36'],
    stock: 50
  },
  {
    id: '4',
    name: 'Vintage Wash T-Shirt',
    description: 'Soft cotton blend with a vintage wash finish',
    price: 34.99,
    image: '/images/tshirt.svg',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 85
  },
  {
    id: '5',
    name: 'Tech Fleece Hoodie',
    description: 'Advanced tech fleece material for maximum comfort',
    price: 89.99,
    image: '/images/hoodie.svg',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 60
  },
  {
    id: '6',
    name: 'Denim Jacket',
    description: 'Classic denim jacket with modern styling',
    price: 99.99,
    image: '/images/jacket.svg',
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40
  },
  {
    id: '7',
    name: 'Athletic Shorts',
    description: 'Lightweight shorts perfect for workouts',
    price: 39.99,
    image: '/images/shorts.svg',
    category: 'Shorts',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 90
  },
  {
    id: '8',
    name: 'Winter Parka',
    description: 'Warm winter parka with faux fur hood',
    price: 149.99,
    image: '/images/parka.svg',
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30
  },
  {
    id: '9',
    name: 'Slim Fit Jeans',
    description: 'Modern slim fit jeans in dark wash',
    price: 69.99,
    image: '/images/jeans.svg',
    category: 'Pants',
    sizes: ['30', '32', '34', '36'],
    stock: 65
  },
  {
    id: '10',
    name: 'Graphic Print T-Shirt',
    description: 'Unique graphic design on premium cotton',
    price: 32.99,
    image: '/images/graphic-tee.svg',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 80
  },
  {
    id: '11',
    name: 'Leather Bomber Jacket',
    description: 'Classic leather bomber jacket with quilted lining',
    price: 199.99,
    image: '/images/leather-jacket.svg',
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25
  },
  {
    id: '12',
    name: 'Performance Leggings',
    description: 'High-performance workout leggings',
    price: 49.99,
    image: '/images/leggings.svg',
    category: 'Activewear',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 70
  }
];
