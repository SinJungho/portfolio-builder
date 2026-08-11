import crypto from 'crypto';
import { env } from '@/lib/env';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES 초기화 벡터 길이

/**
 * 민감 데이터를 AES-256-CBC로 암호화합니다. (예: GitHub access token)
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
 * 암호화된 데이터를 복호화합니다.
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
 * 평문 토큰은 그대로 쓰되, 암호문 복호화 실패 시에는 빈 값으로 안전하게 실패합니다.
 */
export function safeDecrypt(text: string | null | undefined): string {
  if (!text) return '';
  if (!text.includes(':')) return text; // 암호화되지 않은 평문
  try {
    return decrypt(text);
  } catch (err) {
    console.error('토큰 복호화에 실패했습니다:', err);
    return '';
  }
}

/**
 * GitHub Webhook 서명을 HMAC-SHA256으로 검증합니다.
 */
export function verifyGitHubWebhook(
  signature: string | null,
  body: string,
  secret: string | undefined
): boolean {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(body).digest('hex');
  const signatureBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);

  return signatureBuffer.length === digestBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}
