import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const portfolios = await prisma.portfolio.findMany();
  console.log('Total portfolios:', portfolios.length);
  console.log(portfolios);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
