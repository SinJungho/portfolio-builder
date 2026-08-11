import crypto from "crypto";
import { verifyGitHubWebhook } from "./security";

test("webhook verification rejects malformed signatures without throwing", () => {
  expect(verifyGitHubWebhook("sha256=short", "payload", "secret")).toBe(false);
});

test("webhook verification accepts the matching digest", () => {
  const body = "payload";
  const secret = "secret";
  const signature = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;

  expect(verifyGitHubWebhook(signature, body, secret)).toBe(true);
});
