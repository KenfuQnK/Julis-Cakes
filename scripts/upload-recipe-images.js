/**
 * Uploads seed recipe artwork to Neon Object Storage so the app streams the
 * images from a URL instead of bundling multi-megabyte PNGs into the binary.
 *
 * For every PNG/JPEG in assets/images/recipes/ it stores two objects:
 *   recipes/<name>.webp           the version the app consumes (resized + WebP)
 *   recipes/originals/<name>.png  the untouched source, so nothing is lost
 *
 * Requires the NEON_STORAGE_* variables from .env (see .env.example).
 *
 * Run: npm run upload:images
 */
require("dotenv/config");

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const SOURCE_DIR = path.join(__dirname, "../assets/images/recipes");
const PREFIX = "recipes";
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;
// Object keys embed the content hash of the source, so a cached URL never goes
// stale and we can cache aggressively forever.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required (see .env.example)`);
  return value;
}

function getClient() {
  return new S3Client({
    region: requireEnv("NEON_STORAGE_REGION"),
    endpoint: requireEnv("NEON_STORAGE_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("NEON_STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("NEON_STORAGE_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });
}

async function putObject(client, bucket, key, body, contentType) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    }),
  );
}

async function uploadImages() {
  const bucket = requireEnv("NEON_STORAGE_BUCKET");
  const endpoint = requireEnv("NEON_STORAGE_ENDPOINT").replace(/\/$/, "");
  const client = getClient();

  const sources = fs.existsSync(SOURCE_DIR)
    ? fs.readdirSync(SOURCE_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f))
    : [];

  if (!sources.length) {
    console.log(`No images found in ${SOURCE_DIR} — nothing to upload.`);
    return;
  }

  console.log(`Uploading ${sources.length} image(s) to ${bucket}...\n`);

  for (const file of sources) {
    const name = path.parse(file).name;
    const original = fs.readFileSync(path.join(SOURCE_DIR, file));

    const optimized = await sharp(original)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const webpKey = `${PREFIX}/${name}.webp`;
    const originalKey = `${PREFIX}/originals/${file}`;

    await putObject(client, bucket, webpKey, optimized, "image/webp");
    await putObject(
      client,
      bucket,
      originalKey,
      original,
      file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
    );

    const saved = Math.round((1 - optimized.length / original.length) * 100);
    console.log(
      `  ${file}: ${(original.length / 1e6).toFixed(1)} MB -> ` +
        `${(optimized.length / 1e3).toFixed(0)} KB webp (-${saved}%)`,
    );
    console.log(`    ${endpoint}/${bucket}/${webpKey}`);
  }

  console.log("\nDone.");
}

uploadImages().catch((error) => {
  console.error(`Upload failed: ${error.message}`);
  process.exitCode = 1;
});
