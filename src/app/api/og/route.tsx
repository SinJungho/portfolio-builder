import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Slug is required', { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      include: {
        user: true,
      },
    });

    if (!portfolio) {
      return new Response('Portfolio not found', { status: 404 });
    }

    const name = portfolio.user.name || slug;
    const headline = portfolio.title || `${name}'s Portfolio`;
    const avatarUrl = portfolio.user.avatar_url || `https://github.com/${portfolio.user.github_login}.png`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #18181b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #18181b 0%, transparent 50%)',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Accent Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '60%',
              height: '80%',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.15)',
              filter: 'blur(100px)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '60px',
              backgroundColor: 'rgba(24, 24, 27, 0.8)',
              borderRadius: '40px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Avatar Circle */}
            <div
              style={{
                display: 'flex',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #38bdf8',
                marginBottom: '32px',
              }}
            >
              <img
                src={avatarUrl}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            <h1
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '16px',
                textAlign: 'center',
                letterSpacing: '-0.05em',
              }}
            >
              {name}
            </h1>

            <p
              style={{
                fontSize: '32px',
                color: '#38bdf8',
                marginBottom: '24px',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {headline}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '12px 24px',
                borderRadius: '9999px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            >
              <span style={{ fontSize: '20px', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                PROJECT BY PORTFOLIOFORGE
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
