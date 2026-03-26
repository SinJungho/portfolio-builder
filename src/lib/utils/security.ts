import crypto from 'crypto';
import { env } from '@/lib/env';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES

/**
 * Encrypt sensitive data (e.g., GitHub access tokens)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt data
 */
export function decrypt(text: string): string {
  const textParts = text.split(':');
  const ivPart = textParts.shift();
  if (!ivPart) throw new Error('Invalid encrypted text format');
  const iv = Buffer.from(ivPart, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Verify GitHub Webhook signature
 */
export function verifyGitHubWebhook(
  signature: string | null,
  body: string,
  secret: string | undefined
): boolean {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
