/**
 * Seed artwork lives in Neon Object Storage (bucket `julis-cakes-media`), not in
 * the app bundle. Keys are uploaded by `npm run upload:images`.
 *
 * Object storage is branch-scoped in Neon, so the base URL follows the branch:
 * set NEON_STORAGE_PUBLIC_URL when seeding against a branch other than
 * production.
 */
const PRODUCTION_BASE_URL =
  "https://br-broad-dust-b1ogefhd.storage.c-5.eu-central-1.aws.neon.tech/julis-cakes-media/recipes";

const baseUrl = (
  process.env.NEON_STORAGE_PUBLIC_URL ?? PRODUCTION_BASE_URL
).replace(/\/$/, "");

export const seedImages = {
  recipe: `${baseUrl}/hero-swiss-roll.webp`,
  ingredient: `${baseUrl}/ingredients-baking.webp`,
  step: `${baseUrl}/step-whisking.webp`,
} as const;
