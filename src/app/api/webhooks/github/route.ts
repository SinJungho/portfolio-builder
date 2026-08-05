import { NextRequest, NextResponse } from 'next/server';
import { verifyGitHubWebhook } from '@/lib/utils/security';
import { prisma } from '@/lib/prisma';
import { projectService } from '@/services/project';
import { env } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import { apiError, logRouteError, logRouteWarning, routeError } from '@/lib/api/errors';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-hub-signature-256');
  const event = req.headers.get('x-github-event');

  // 웹훅 서명을 검증한다.
  if (!verifyGitHubWebhook(signature, body, env.GITHUB_WEBHOOK_SECRET)) {
    logRouteWarning('/api/webhooks/github', 'POST', new Error('Invalid signature'), 'Invalid signature');
    return apiError("WEBHOOK_INVALID_SIGNATURE", 401);
  }

  try {
    const payload = JSON.parse(body);

    // 이벤트를 처리한다.
    switch (event) {
      case 'push': {
        const repositoryId = payload.repository.id.toString();
        const senderId = payload.sender.id;
        const pushedAt = new Date(payload.repository.pushed_at);

        // GitHub ID로 사용자를 찾는다.
        const user = await prisma.user.findUnique({
          where: { github_id: BigInt(senderId) }
        });

        if (user) {
          await projectService.updatePushStatus(user.id, repositoryId, pushedAt);
          
          // 변경된 포트폴리오 페이지를 즉시 재검증한다.
          try {
            const portfolios = await prisma.portfolio.findMany({ where: { user_id: user.id } });
            for (const p of portfolios) {
              revalidatePath(`/${p.slug}`);
            }
            revalidatePath(`/dashboard`);
            console.log(`[GitHub Webhook] Revalidation triggered for User: ${user.id}`);
          } catch (revalidateError) {
            logRouteError('/api/webhooks/github/revalidate', 'POST', revalidateError);
            // 재검증 실패가 웹훅 실패로 이어지지 않게 한다.
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
      return apiError('WEBHOOK_BAD_REQUEST', 400);
    }
    return routeError('/api/webhooks/github', 'POST', error);
  }
}
