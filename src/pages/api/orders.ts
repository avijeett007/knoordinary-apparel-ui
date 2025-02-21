import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET /api/orders - Get orders by phone number or order ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { phoneNumber, orderId } = req.query;

    // If no query parameters, return all orders
    if (!phoneNumber && !orderId) {
      const allOrders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json(allOrders);
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { phoneNumber: phoneNumber as string },
          { id: orderId as string }
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message || 'Error fetching orders' });
  }
}

// POST /api/orders - Create new order
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
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
          status: 'pending',
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
}

// PUT /api/orders - Update order (items or status)
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const order = req.body;

    if (!order || !order.id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true }
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Start transaction for updates
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status if changed
      if (order.status !== existingOrder.status) {
        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: order.status,
            shippingAddress: order.shippingAddress,
            total: order.total
          }
        });
      }

      // Update order items
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const existingItem = existingOrder.items.find(i => i.id === item.id);
          
          if (!existingItem) {
            throw new Error(`Order item ${item.id} not found`);
          }

          // If quantity or size is changing, update the item
          if (item.quantity !== existingItem.quantity || item.size !== existingItem.size) {
            // If quantity is changing, update product stock
            if (item.quantity !== existingItem.quantity) {
              const product = await tx.product.findUnique({
                where: { id: existingItem.productId }
              });

              if (!product) {
                throw new Error(`Product ${existingItem.productId} not found`);
              }

              // Calculate stock difference
              const stockDiff = existingItem.quantity - item.quantity;
              
              // Check if enough stock for increase
              if (stockDiff < 0 && product.stock < Math.abs(stockDiff)) {
                throw new Error(`Insufficient stock for product ${product.name}`);
              }

              // Update product stock
              await tx.product.update({
                where: { id: product.id },
                data: { stock: product.stock + stockDiff }
              });
            }

            // Update order item
            await tx.orderItem.update({
              where: { id: item.id },
              data: {
                quantity: item.quantity,
                size: item.size
              }
            });
          }
        }
      }

      // Return the updated order with items
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: error.message || 'Failed to update order' });
  }
}

// DELETE /api/orders - Cancel order
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId as string },
      include: { items: true }
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (existingOrder.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Start transaction for cancellation
    await prisma.$transaction(async (tx) => {
      // Update order status to cancelled
      await tx.order.update({
        where: { id: orderId as string },
        data: { status: 'cancelled' }
      });

      // Restore product stock
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    });

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json({ message: error.message || 'Failed to cancel order' });
  }
}
