import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';
import { normalizePortfolioSlug } from '@/lib/portfolio-url';
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch portfolio and user data
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: normalizePortfolioSlug(slug) },
    include: {
      user: {
        select: {
          name: true,
          avatar_url: true,
          github_bio: true,
        },
      },
    },
  });

  if (!portfolio) {
    return new Response('Not found', { status: 404 });
  }

  const { title, user } = portfolio;
  const userName = user.name || 'Developer';
  const bio = user.github_bio || '';

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
          backgroundColor: '#121212',
          position: 'relative',
        }}
      >

        {/* Card Structure */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '85%',
            height: '75%',
            backgroundColor: '#181818',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '80px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Logo Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '60px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1ED760',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#121212',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
              }}
            >
              PortfolioForge
            </span>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h1
              style={{
                fontSize: '72px',
                fontWeight: '900',
                color: '#FFFFFF',
                margin: '0 0 24px 0',
                letterSpacing: '-2px',
                lineHeight: 1.1,
              }}
            >
              {title || `${userName}'s Portfolio`}
            </h1>
            <p
              style={{
                fontSize: '32px',
                color: '#B3B3B3',
                margin: 0,
                lineHeight: 1.4,
                maxWidth: '90%',
              }}
            >
              {bio.length > 120 ? `${bio.substring(0, 120)}...` : bio}
            </p>
          </div>

          {/* Footer Profile Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '40px',
            }}
          >
             {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={userName}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '100%',
                  border: '4px solid rgba(255,255,255,0.08)',
                }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF' }}>
                {userName}
              </span>
              <span style={{ fontSize: '20px', color: '#B3B3B3' }}>
                {slug}.portfolioforge.app
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
