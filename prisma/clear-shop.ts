import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');

  // Order matters due to foreign key constraints
  // Delete OrderItems first, then Orders (if related to products, but usually orders have products)
  // Delete Products
  // Delete Categories

  // Note: OrderItems reference Products. If we delete products, we might violate FKs if there are orders.
  // Assuming this is a dev environment reset or we want to clear shop items specifically.
  // If we want to keep orders but clear current products, that's tricky if FKs are strict.
  // Let's assume we can clear everything shop-related for a fresh start.
  
  await prisma.orderItem.deleteMany();
  console.log('Deleted all order items.');
  
  await prisma.order.deleteMany();
  console.log('Deleted all orders.');

  await prisma.product.deleteMany();
  console.log('Deleted all products.');

  await prisma.category.deleteMany();
  console.log('Deleted all categories.');

  console.log('Database cleared successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
