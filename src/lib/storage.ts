import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "./env";

/**
 * Supabase Storage S3-Compatible Client
 * 
 * 필수 환경 변수:
 * - SUPABASE_STORAGE_ENDPOINT: https://[project-ref].supabase.co/storage/v1/s3
 * - SUPABASE_STORAGE_ACCESS_KEY: [Project Settings > API > S3 Access Key]
 * - SUPABASE_STORAGE_SECRET_KEY: [Project Settings > API > S3 Secret Key]
 * - SUPABASE_STORAGE_REGION: e.g. ap-northeast-2
 * - SUPABASE_STORAGE_BUCKET: 버킷 이름
 */

let s3Client: S3Client | null = null;

export function publicStorageUrl(endpoint: string, bucket: string, key: string): string {
  const url = new URL(endpoint);
  if (url.hostname.endsWith(".storage.supabase.co")) {
    url.hostname = url.hostname.replace(".storage.supabase.co", ".supabase.co");
  }
  const objectPath = [bucket, ...key.split("/")].map(encodeURIComponent).join("/");
  url.pathname = `/storage/v1/object/public/${objectPath}`;
  url.search = "";
  return url.toString();
}

export function getStorageClient() {
  const env = getEnv();
  
  if (
    !env.SUPABASE_STORAGE_ENDPOINT || 
    !env.SUPABASE_STORAGE_ACCESS_KEY || 
    !env.SUPABASE_STORAGE_SECRET_KEY || 
    !env.SUPABASE_STORAGE_REGION
  ) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.SUPABASE_STORAGE_ENDPOINT,
      region: env.SUPABASE_STORAGE_REGION,
      credentials: {
        accessKeyId: env.SUPABASE_STORAGE_ACCESS_KEY,
        secretAccessKey: env.SUPABASE_STORAGE_SECRET_KEY,
      },
      forcePathStyle: true, // Supabase requires this for S3-compatible API
    });
  }

  return s3Client;
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const client = getStorageClient();
  const env = getEnv();
  
  if (!client || !env.SUPABASE_STORAGE_ENDPOINT || !env.SUPABASE_STORAGE_BUCKET) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  const key = `uploads/${Date.now()}-${fileName}`;
  
  await client.send(
    new PutObjectCommand({
      Bucket: env.SUPABASE_STORAGE_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return publicStorageUrl(
    env.SUPABASE_STORAGE_ENDPOINT,
    env.SUPABASE_STORAGE_BUCKET,
    key,
  );
}
