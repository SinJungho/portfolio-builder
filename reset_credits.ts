import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.updateMany({
    data: { ai_credits: 3 },
  });
  console.log(`Updated ${users.count} users' ai_credits to 3.`);

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, ai_credits: true }
  });
  console.log("Current user credits:", allUsers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
