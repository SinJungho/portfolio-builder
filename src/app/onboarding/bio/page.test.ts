import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(process.cwd(), "src/app/onboarding/bio/page.tsx"), "utf8");

describe("onboarding bio hardening", () => {
  it("cancels in-flight checks and prevents concurrent refreshes", () => {
    expect(page).toContain("new AbortController()");
    expect(page).toContain("signal: controller.signal");
    expect(page).toContain("requestRef.current?.abort()");
  });

  it("only rechecks after returning from the GitHub tab and keeps status announcements scoped", () => {
    expect(page).toContain("githubTabWasHiddenRef");
    expect(page).toContain('document.visibilityState === "hidden"');
    expect(page).toContain("if (githubTabWasHiddenRef.current)");
    expect(page).toContain('<div aria-busy={status === "loading"}>');
    expect(page).toContain("GitHub 프로필 → Bio에 한 줄만 추가하면 돼요.");
    expect(page).toContain("새 탭에서 열림");
  });

  it("shows a short, ordered Bio setup guide without creating an in-app source of truth", () => {
    expect(page).toContain("3단계로 끝나요");
    expect(page).toContain('aria-label="GitHub 소개 추가 방법"');
    expect(page).toContain("GitHub Bio에 저장해요");
    expect(page).toContain("돌아오면 소개를 자동으로 다시 확인해요.");
  });
});
