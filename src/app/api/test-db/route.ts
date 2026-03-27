import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Test Create',
        email: 'testcreate@users.noreply.github.com',
        image: 'https://avatar.url',
        github_login: 'testcreate',
        github_id: 123456789,
        github_bio: 'Hello world',
        // Note: we do not provide id here, relying on default(uuid())
      }
    });
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
