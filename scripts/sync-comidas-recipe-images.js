const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");

require("dotenv").config({ quiet: true });

const sharp = require("sharp");
const { Pool } = require("pg");
const {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");

const GALLERY_FILE = path.join(__dirname, "../comidas/comidas.json");
const PHOTO_DIRECTORY = path.join(__dirname, "../comidas/fotos");
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required (see .env.example)`);
  return value;
}

function normalizeDatabaseUrl(value) {
  const connectionUrl = new URL(value);
  connectionUrl.searchParams.delete("sslmode");
  connectionUrl.searchParams.delete("channel_binding");
  return connectionUrl.toString().replace(/\?$/, "");
}

async function getPhotoSource(photo) {
  const filename = path.basename(photo.file);
  if (filename !== photo.file) throw new Error("Invalid gallery photo path");

  const source = await fs.readFile(path.join(PHOTO_DIRECTORY, filename));
  const digest = createHash("sha256").update(source).digest("hex");
  return { source, digest, filename };
}

async function encodePhoto(source, photo, failOn) {
  const oriented = await sharp(source, { failOn }).rotate().toBuffer();
  let pipeline = sharp(oriented);

  if (photo.crop) {
    const metadata = await sharp(oriented).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Could not read dimensions for ${photo.file}`);
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

  const body = await pipeline
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return body;
}

async function optimizePhoto(source, photo) {
  try {
    return await encodePhoto(source, photo, "warning");
  } catch (error) {
    try {
      return await encodePhoto(source, photo, "none");
    } catch {
      throw new Error(
        `Could not process ${photo.file}: ${error instanceof Error ? error.message : "unknown image error"}`,
      );
    }
  }
}

function getObjectPrefix(imageUri, dishId, endpoint, bucket) {
  const imageUrl = new URL(imageUri);
  if (imageUrl.origin !== new URL(endpoint).origin) {
    throw new Error(`Unexpected storage host for ${dishId}`);
  }
  const parts = imageUrl.pathname.split("/").filter(Boolean);
  if (parts[0] !== bucket) {
    throw new Error(`Unexpected storage bucket for ${dishId}`);
  }

  const objectKey = parts.slice(1).join("/");
  const markerIndex = objectKey.indexOf(`${dishId}-`);
  if (markerIndex < 0) {
    throw new Error(`Could not derive the existing image path for ${dishId}`);
  }
  return objectKey.slice(0, markerIndex);
}

async function objectExists(storage, bucket, key) {
  try {
    await storage.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

async function main() {
  const endpoint = requireEnv("NEON_STORAGE_ENDPOINT").replace(/\/$/, "");
  const bucket = requireEnv("NEON_STORAGE_BUCKET");
  const scopeKey = requireEnv("JULIS_RECIPES_SCOPE_KEY");
  const dryRun = process.argv.includes("--dry-run");
  const storage = new S3Client({
    region: requireEnv("NEON_STORAGE_REGION"),
    endpoint,
    credentials: {
      accessKeyId: requireEnv("NEON_STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("NEON_STORAGE_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });
  const pool = new Pool({
    connectionString: normalizeDatabaseUrl(requireEnv("DATABASE_URL")),
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 10_000,
  });

  try {
    const gallery = JSON.parse(await fs.readFile(GALLERY_FILE, "utf8"));
    if (!Array.isArray(gallery.dishes) || gallery.dishes.length === 0) {
      throw new Error("comidas/comidas.json has no dishes to sync");
    }

    const recipeIds = gallery.dishes.map((dish) => `comida-${dish.id}`);
    const recipesResult = await pool.query(
      `SELECT id, image_uri, is_user_created, created_by_scope
       FROM recipes WHERE id = ANY($1)`,
      [recipeIds],
    );
    if (recipesResult.rowCount !== recipeIds.length) {
      throw new Error(
        `Recipe mapping mismatch (${recipesResult.rowCount}/${recipeIds.length})`,
      );
    }

    const recipes = new Map(recipesResult.rows.map((row) => [row.id, row]));
    const imageRows = await pool.query(
      "SELECT recipe_id, image_uri FROM recipe_images WHERE recipe_id = ANY($1)",
      [recipeIds],
    );
    const imageUrisByRecipe = new Map();
    for (const row of imageRows.rows) {
      const recipeImages = imageUrisByRecipe.get(row.recipe_id) ?? new Set();
      recipeImages.add(row.image_uri);
      imageUrisByRecipe.set(row.recipe_id, recipeImages);
    }

    const jobs = [];
    let uploadedCount = 0;
    for (const dish of gallery.dishes) {
      const recipeId = `comida-${dish.id}`;
      const recipe = recipes.get(recipeId);
      if (
        !recipe?.is_user_created ||
        recipe.created_by_scope !== scopeKey ||
        !recipe.image_uri
      ) {
        throw new Error(
          `Recipe is missing or not owned by this installation: ${dish.id}`,
        );
      }
      if (!dish.id || !dish.title?.trim() || !Array.isArray(dish.photos)) {
        throw new Error(`Invalid gallery dish: ${dish.id ?? "unknown"}`);
      }
      const cover = dish.photos.find((photo) => photo.file === dish.cover);
      if (!cover) throw new Error(`Cover photo is missing for ${dish.id}`);

      const prefix = getObjectPrefix(
        recipe.image_uri,
        dish.id,
        endpoint,
        bucket,
      );
      const coverUpload = await getPhotoSource(cover);
      const expectedCoverKey = `${prefix}${dish.id}-${coverUpload.digest}.webp`;
      const currentCoverUrl = new URL(recipe.image_uri);
      const currentCoverKey = currentCoverUrl.pathname
        .split("/")
        .filter(Boolean)
        .slice(1)
        .join("/");
      if (currentCoverKey !== expectedCoverKey) {
        throw new Error(
          `The existing cover does not match ${dish.id}/${cover.file}`,
        );
      }

      const orderedPhotos = [
        cover,
        ...dish.photos.filter((photo) => photo.file !== cover.file),
      ];
      const existingImageUris = imageUrisByRecipe.get(recipeId) ?? new Set();
      for (const [index, photo] of orderedPhotos.entries()) {
        const { source, digest, filename } = await getPhotoSource(photo);
        const key = `${prefix}${dish.id}-${digest}.webp`;
        const publicUrl = `${endpoint}/${bucket}/${key}`;
        const exists = await objectExists(storage, bucket, key);
        if (!exists && !dryRun) {
          const body = await optimizePhoto(source, photo);
          await storage.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: body,
              ContentType: "image/webp",
              CacheControl: CACHE_CONTROL,
            }),
          );
          uploadedCount += 1;
          if (uploadedCount % 10 === 0) {
            console.log(`Uploaded ${uploadedCount} missing photos…`);
          }
        }
        jobs.push({
          recipeId,
          dishId: dish.id,
          filename,
          key,
          publicUrl,
          sortOrder: index,
          exists,
          alreadyAttached: existingImageUris.has(publicUrl),
        });
      }
    }

    const missingObjects = jobs.filter((job) => !job.exists);
    const missingRows = jobs.filter((job) => !job.alreadyAttached);
    if (!dryRun && missingRows.length) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const job of missingRows) {
          const fileHash = createHash("sha256")
            .update(job.filename)
            .digest("hex")
            .slice(0, 20);
          const imageId = `${job.recipeId}-photo-${fileHash}`;
          await client.query(
            `INSERT INTO recipe_images (
               id, recipe_id, image_uri, image_kind, sort_order
             ) VALUES ($1, $2, $3, 'gallery', $4)
             ON CONFLICT (id) DO NOTHING`,
            [imageId, job.recipeId, job.publicUrl, job.sortOrder],
          );
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    console.log(
      JSON.stringify({
        recipes: recipeIds.length,
        photos: jobs.length,
        alreadyInStorage: jobs.length - missingObjects.length,
        uploaded: dryRun ? 0 : missingObjects.length,
        alreadyAttached: jobs.length - missingRows.length,
        attached: dryRun ? 0 : missingRows.length,
        mode: dryRun ? "dry-run" : "sync",
      }),
    );
  } finally {
    await Promise.all([pool.end(), storage.destroy()]);
  }
}

main().catch((error) => {
  console.error(`Recipe photo sync failed: ${error.message}`);
  process.exitCode = 1;
});
