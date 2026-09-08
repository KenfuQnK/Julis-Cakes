-- Recipe artwork moved out of the app bundle and into Neon Object Storage.
-- Rewrites the old `sample:*` sentinels, which used to resolve to PNGs shipped
-- inside the binary, to the public URLs of the uploaded WebP renditions.
DO $$
DECLARE
  base_url CONSTANT TEXT :=
    'https://br-broad-dust-b1ogefhd.storage.c-5.eu-central-1.aws.neon.tech/julis-cakes-media/recipes';
BEGIN
  UPDATE recipes SET image_uri = base_url || '/hero-swiss-roll.webp'
    WHERE image_uri = 'sample:recipe';
  UPDATE recipe_ingredients SET image_uri = base_url || '/ingredients-baking.webp'
    WHERE image_uri = 'sample:ingredient';
  UPDATE recipe_steps SET image_uri = base_url || '/step-whisking.webp'
    WHERE image_uri = 'sample:step';

  UPDATE recipe_images SET image_uri = base_url || '/hero-swiss-roll.webp'
    WHERE image_uri = 'sample:recipe';
  UPDATE recipe_images SET image_uri = base_url || '/ingredients-baking.webp'
    WHERE image_uri = 'sample:ingredient';
  UPDATE recipe_images SET image_uri = base_url || '/step-whisking.webp'
    WHERE image_uri = 'sample:step';
END $$;
