import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, phoneNumber, total, items, shippingAddress, paymentDetails } = req.body;

      // Validate required fields
      if (!userId || !phoneNumber || !total || !items || !shippingAddress || !paymentDetails) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Start a transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create the order first
        const newOrder = await tx.order.create({
          data: {
            userId,
            phoneNumber,
            total,
            status: 'pending',  // Set initial status
            shippingAddress,
            paymentDetails,
          },
        });

        // Create order items and update stock
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
          }

          // Create order item
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              size: item.size,
              price: item.price,
            },
          });

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock - item.quantity },
          });
        }

        // Return the complete order with items
        return tx.order.findUnique({
          where: { id: newOrder.id },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({ message: error.message || 'Failed to create order' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
