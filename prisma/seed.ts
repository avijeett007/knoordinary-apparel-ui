import { PrismaClient } from '@prisma/client';
import { products } from '../src/data/products';

const prisma = new PrismaClient();

async function main() {
  // Delete existing products
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image,
        category: product.category,
        sizes: JSON.stringify(product.sizes),
        stock: product.stock,
      },
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
