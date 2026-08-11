/**
 * Vercel Domains API 서비스
 * 커스텀 도메인 추가, 삭제 및 설정 확인을 담당합니다.
 */
export class DomainService {
  private readonly baseUrl = 'https://api.vercel.com/v9/projects';
  private readonly token = process.env.VERCEL_ACCESS_TOKEN || "";
  private readonly projectId = process.env.VERCEL_PROJECT_ID || "";
  private readonly teamId = process.env.VERCEL_TEAM_ID || "";

  /**
   * Vercel 연동 자격증명이 갖춰졌는지 여부.
   * 미설정은 오류가 아니라 "수동 DNS 안내" 경로를 뜻한다.
   */
  isConfigured(): boolean {
    return Boolean(this.token && this.projectId);
  }

  /**
   * Vercel API 호출 공통 유틸리티
   */
  private async fetchVercel(path: string, options: RequestInit = {}) {
    if (!this.token || !this.projectId) {
      throw new Error('Vercel domain integration is not configured');
    }
    const url = new URL(`${this.baseUrl}/${this.projectId}${path}`);
    if (this.teamId) {
      url.searchParams.set('teamId', this.teamId);
    }

    const res = await fetch(url.toString(), {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Vercel API error: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Vercel 프로젝트에 도메인 추가
   */
  async addDomain(domain: string) {
    return this.fetchVercel('/domains', {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });
  }

  /**
   * Vercel 프로젝트에서 도메인 삭제
   */
  async removeDomain(domain: string) {
    return this.fetchVercel(`/domains/${encodeURIComponent(domain)}`, {
      method: 'DELETE',
    });
  }

  /**
   * 도메인의 DNS 설정 및 상태 조회
   */
  async getDomainConfig(domain: string) {
    return this.fetchVercel(`/domains/${encodeURIComponent(domain)}/config`, {
      method: 'GET',
    });
  }

  /**
   * 도메인 소유권 재검증 요청
   */
  async verifyDomain(domain: string) {
    return this.fetchVercel(`/domains/${encodeURIComponent(domain)}/verify`, {
      method: 'POST',
    });
  }

  /**
   * 특정 도메인의 상태 요약 조회 (DNS 설정 여부 등)
   */
  async getDomainStatus(domain: string) {
    try {
      const config = await this.getDomainConfig(domain);
      // config.misconfigured 가 true이면 설정 오류가 있는 것임
      return {
        configured: !config.misconfigured,
        config,
      };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const domainService = new DomainService();
