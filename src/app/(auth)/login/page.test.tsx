import { signIn } from "@/auth";
import { isValidElement, type ReactNode } from "react";
import LoginPage from "./page";

jest.mock("@/auth", () => ({ signIn: jest.fn() }));

function findForm(node: ReactNode): React.ReactElement<{ action: () => Promise<void> }> | undefined {
  if (!isValidElement(node)) return;
  if (node.type === "form") return node as React.ReactElement<{ action: () => Promise<void> }>;
  const children = (node.props as { children?: ReactNode }).children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const form = findForm(child);
    if (form) return form;
  }
}

describe("LoginPage", () => {
  it.each([
    [["/editor/first", "/editor/second"], "/dashboard"],
    ["/editor/portfolio?tab=publish", "/editor/portfolio?tab=publish"],
    ["https://example.com", "/dashboard"],
    ["//example.com", "/dashboard"],
    [undefined, "/dashboard"],
  ])("uses a safe redirect for callbackUrl %p", async (callbackUrl, redirectTo) => {
    const page = await LoginPage({ searchParams: Promise.resolve({ callbackUrl }) });
    await findForm(page)?.props.action();

    expect(signIn).toHaveBeenCalledWith("github", { redirectTo });
  });
});
