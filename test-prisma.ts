import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Test User 2',
        email: 'test2@example.com',
        image: 'https://avatar.url',
        github_login: 'testuser2',
        github_id: 123456789,
        github_bio: 'Hello world',
      }
    })
    console.log("Success:", user)
  } catch (e) {
    console.error("Error:", e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
