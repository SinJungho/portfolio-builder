import { env } from "@/lib/env";

export interface VercelDomainResponse {
  name: string;
  verified: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason?: string;
  }[];
}

export interface DomainStatus {
  verified: boolean;
  misconfigured: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
  }[];
}

export class DomainService {
  private readonly baseUrl = "https://api.vercel.com";
  private readonly token = env.VERCEL_ACCESS_TOKEN;
  private readonly projectId = env.VERCEL_PROJECT_ID;

  private get headers() {
    if (!this.token) {
      throw new Error("VERCEL_ACCESS_TOKEN이 설정되지 않았습니다.");
    }
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Vercel 프로젝트에 도메인 추가
   */
  async addDomain(domain: string): Promise<VercelDomainResponse> {
    if (!this.projectId) throw new Error("VERCEL_PROJECT_ID가 필요합니다.");

    const res = await fetch(
      `${this.baseUrl}/v10/projects/${this.projectId}/domains`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ name: domain }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "도메인 추가에 실패했습니다.");
    }

    return data;
  }

  /**
   * 도메인 DNS 검증 트리거
   */
  async verifyDomain(domain: string): Promise<boolean> {
    if (!this.projectId) throw new Error("VERCEL_PROJECT_ID가 필요합니다.");

    const res = await fetch(
      `${this.baseUrl}/v9/projects/${this.projectId}/domains/${domain}/verify`,
      {
        method: "POST",
        headers: this.headers,
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "도메인 검증에 실패했습니다.");
    }

    return data.verified;
  }

  /**
   * 도메인 상태 및 DNS 레코드 정보 조회
   */
  async getDomainStatus(domain: string): Promise<DomainStatus> {
    if (!this.projectId) throw new Error("VERCEL_PROJECT_ID가 필요합니다.");

    const res = await fetch(
      `${this.baseUrl}/v9/projects/${this.projectId}/domains/${domain}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "도메인 상태 조회에 실패했습니다.");
    }

    return {
      verified: data.verified,
      misconfigured: data.misconfigured,
      verification: data.verification,
    };
  }

  /**
   * 도메인 삭제
   */
  async removeDomain(domain: string): Promise<boolean> {
    if (!this.projectId) throw new Error("VERCEL_PROJECT_ID가 필요합니다.");

    const res = await fetch(
      `${this.baseUrl}/v9/projects/${this.projectId}/domains/${domain}`,
      {
        method: "DELETE",
        headers: this.headers,
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "도메인 삭제에 실패했습니다.");
    }

    return true;
  }
}

export const domainService = new DomainService();
