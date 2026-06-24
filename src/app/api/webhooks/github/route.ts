import { NextRequest, NextResponse } from 'next/server';
import { verifyGitHubWebhook } from '@/lib/utils/security';
import { prisma } from '@/lib/prisma';
import { projectService } from '@/services/project';
import { env } from '@/lib/env';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-hub-signature-256');
  const event = req.headers.get('x-github-event');

  // 1. Signature Verification (STEP 2 Security Rule)
  if (!verifyGitHubWebhook(signature, body, env.GITHUB_WEBHOOK_SECRET)) {
    console.error('[GitHub Webhook] Invalid signature');
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(body);

    // 2. Event Handling
    switch (event) {
      case 'push': {
        const repositoryId = payload.repository.id.toString();
        const senderId = payload.sender.id;
        const pushedAt = new Date(payload.repository.pushed_at);

        // Find user by github_id
        const user = await prisma.user.findUnique({
          where: { github_id: BigInt(senderId) }
        });

        if (user) {
          await projectService.updatePushStatus(user.id, repositoryId, pushedAt);
          
          // on-demand revalidation 실행 (포트폴리오 페이지 즉시 반영)
          try {
            const portfolios = await prisma.portfolio.findMany({ where: { user_id: user.id } });
            for (const p of portfolios) {
              revalidatePath(`/${p.slug}`);
            }
            revalidatePath(`/dashboard`);
            console.log(`[GitHub Webhook] Revalidation triggered for User: ${user.id}`);
          } catch (revalidateError) {
            console.error('[GitHub Webhook] Revalidation failed:', revalidateError);
            // Revalidation 실패가 Webhook 전체 실패로 이어지지 않도록 함
          }
          
          console.log(`[GitHub Webhook] Updated push status for repo ${repositoryId} (User: ${user.id})`);
        }
        break;
      }

      case 'ping':
        console.log('[GitHub Webhook] Ping received');
        return NextResponse.json({ message: 'pong' });

      default:
        console.log(`[GitHub Webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('[GitHub Webhook] Invalid JSON payload');
      return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }
    console.error('[GitHub Webhook] Error:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}
