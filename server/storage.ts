/**
 * Presigned uploads to Neon Object Storage.
 *
 * The API server never proxies image bytes: it hands the client a short-lived
 * signed PUT URL and the client streams the file straight to the bucket. The
 * S3 credentials therefore stay server-side and out of the app bundle.
 */
import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_PREFIX = "uploads";
const SIGNED_URL_TTL_SECONDS = 300;
// Keys are random per upload, so an object never changes under a given URL.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const UPLOAD_CONTENT_TYPES = Object.keys(EXTENSION_BY_CONTENT_TYPE);

export interface UploadTicket {
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
  expiresIn: number;
}

interface StorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

let cachedClient: S3Client | undefined;

function readConfig(): StorageConfig | undefined {
  const endpoint = process.env.NEON_STORAGE_ENDPOINT;
  const region = process.env.NEON_STORAGE_REGION;
  const bucket = process.env.NEON_STORAGE_BUCKET;
  const accessKeyId = process.env.NEON_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEON_STORAGE_SECRET_ACCESS_KEY;
  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey)
    return undefined;
  return {
    endpoint: endpoint.replace(/\/$/, ""),
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
  };
}

export function isStorageConfigured(): boolean {
  return Boolean(readConfig());
}

function getClient(config: StorageConfig): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Required whenever the S3 client talks to a custom endpoint.
    forcePathStyle: true,
  });
  return cachedClient;
}

export async function createUploadTicket(
  scopeKey: string,
  contentType: string,
): Promise<UploadTicket> {
  const config = readConfig();
  if (!config) throw new Error("Object storage is not configured");

  const extension = EXTENSION_BY_CONTENT_TYPE[contentType];
  if (!extension) throw new Error("Invalid upload content type");

  const key = `${UPLOAD_PREFIX}/${scopeKey}/${randomUUID()}.${extension}`;
  // Both headers are part of the signature, so the client has to echo them back
  // on the PUT — they are returned alongside the URL for exactly that reason.
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": CACHE_CONTROL,
  };

  const uploadUrl = await getSignedUrl(
    getClient(config),
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    }),
    { expiresIn: SIGNED_URL_TTL_SECONDS },
  );

  return {
    uploadUrl,
    publicUrl: `${config.endpoint}/${config.bucket}/${key}`,
    headers,
    expiresIn: SIGNED_URL_TTL_SECONDS,
  };
}
