/**
 * Imports the local comidas/ gallery as editable recipe cards.
 * Existing recipe and gallery data is left intact on repeated runs.
 *
 * Run: node scripts/import-comidas-gallery.js
 * Run with the target app installation's scope:
 * JULIS_RECIPES_SCOPE_KEY=<client scope> node scripts/import-comidas-gallery.js
 */
require("dotenv/config");

const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const { Pool } = require("pg");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const GALLERY_FILE = path.join(PROJECT_ROOT, "comidas", "comidas.json");
const PHOTO_DIRECTORY = path.join(PROJECT_ROOT, "comidas", "fotos");
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required (see .env.example)`);
  return value;
}

function resolveScopeKey() {
  const scopeKey = process.env.JULIS_RECIPES_SCOPE_KEY;
  if (!scopeKey || !/^[a-zA-Z0-9._-]{8,160}$/.test(scopeKey)) {
    throw new Error(
      "Set JULIS_RECIPES_SCOPE_KEY to the target app installation's collection.",
    );
  }
  return scopeKey;
}

async function getCoverBuffer(photo) {
  const filename = path.basename(photo.file);
  if (filename !== photo.file) throw new Error("Invalid gallery photo path");
  const sourcePath = path.join(PHOTO_DIRECTORY, filename);
  const source = await fs.readFile(sourcePath);
  const oriented = await sharp(source).rotate().toBuffer();
  let pipeline = sharp(oriented);

  if (photo.crop) {
    const metadata = await sharp(oriented).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Could not read dimensions for ${filename}`);
    }
    const left = Math.max(0, Math.floor(photo.crop.x * metadata.width));
    const top = Math.max(0, Math.floor(photo.crop.y * metadata.height));
    const width = Math.min(
      metadata.width - left,
      Math.max(1, Math.round(photo.crop.width * metadata.width)),
    );
    const height = Math.min(
      metadata.height - top,
      Math.max(1, Math.round(photo.crop.height * metadata.height)),
    );
    pipeline = pipeline.extract({ left, top, width, height });
  }

  const optimized = await pipeline
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { optimized, digest: createHash("sha256").update(source).digest("hex") };
}

async function main() {
  const endpoint = requireEnv("NEON_STORAGE_ENDPOINT").replace(/\/$/, "");
  const bucket = requireEnv("NEON_STORAGE_BUCKET");
  const storage = new S3Client({
    region: requireEnv("NEON_STORAGE_REGION"),
    endpoint,
    credentials: {
      accessKeyId: requireEnv("NEON_STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("NEON_STORAGE_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });
  const connectionUrl = new URL(requireEnv("DATABASE_URL"));
  connectionUrl.searchParams.delete("sslmode");
  connectionUrl.searchParams.delete("channel_binding");
  const pool = new Pool({
    connectionString: connectionUrl.toString().replace(/\?$/, ""),
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 10_000,
  });

  try {
    const gallery = JSON.parse(await fs.readFile(GALLERY_FILE, "utf8"));
    if (!Array.isArray(gallery.dishes) || gallery.dishes.length === 0) {
      throw new Error("comidas/comidas.json has no dishes to import");
    }
    const scopeKey = resolveScopeKey();
    const imported = [];

    for (const dish of gallery.dishes) {
      const photo =
        dish.photos?.find((item) => item.file === dish.cover) ??
        dish.photos?.find((item) => item.hidden !== true) ??
        dish.photos?.[0];
      if (!dish.id || !dish.title?.trim() || !photo) {
        throw new Error(`Dish ${dish.id ?? "unknown"} has no usable cover`);
      }

      const { optimized, digest } = await getCoverBuffer(photo);
      const recipeId = `comida-${dish.id}`;
      const key = `uploads/${scopeKey}/comidas/${dish.id}-${digest}.webp`;
      const publicUrl = `${endpoint}/${bucket}/${key}`;

      await storage.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: optimized,
          ContentType: "image/webp",
          CacheControl: CACHE_CONTROL,
        }),
      );
      await storage.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      imported.push({ id: recipeId, title: dish.title.trim(), publicUrl });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO recipe_lists (id, scope_key, name, list_type)
         VALUES ($1, $2, 'Mis recetas', 'created')
         ON CONFLICT (scope_key, list_type) DO NOTHING`,
        [`${scopeKey}-created`, scopeKey],
      );

      for (const recipe of imported) {
        const inserted = await client.query(
          `INSERT INTO recipes (
             id, title, description, image_uri, category,
             is_user_created, created_by_scope
           ) VALUES ($1, $2, '', $3, NULL, TRUE, $4)
           ON CONFLICT (id) DO NOTHING
           RETURNING id`,
          [recipe.id, recipe.title, recipe.publicUrl, scopeKey],
        );

        if (inserted.rowCount) {
          await client.query(
            `INSERT INTO recipe_images (id, recipe_id, image_uri, image_kind, sort_order)
             VALUES ($1, $2, $3, 'cover', 0)
             ON CONFLICT (id) DO NOTHING`,
            [`${recipe.id}-cover`, recipe.id, recipe.publicUrl],
          );
        } else {
          const existing = await client.query(
            `SELECT id FROM recipes
             WHERE id = $1 AND is_user_created = TRUE AND created_by_scope = $2`,
            [recipe.id, scopeKey],
          );
          if (!existing.rowCount) {
            throw new Error(`Recipe ID collision for ${recipe.id}`);
          }
        }

        await client.query(
          `INSERT INTO recipe_list_items (list_id, recipe_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [`${scopeKey}-created`, recipe.id],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    console.log(
      JSON.stringify({ imported: imported.length, target: "Mis recetas" }),
    );
  } finally {
    await Promise.all([pool.end(), storage.destroy()]);
  }
}

main().catch((error) => {
  console.error(`Gallery import failed: ${error.message}`);
  process.exitCode = 1;
});
