import type { PoolClient } from "pg";

import { getPool, withTransaction } from "./db";

type RecipeCategory = "desserts" | "healthy" | "quick" | "airFryer";

export interface RecipeIngredientInput {
  id: string;
  name: string;
  amount: string;
  imageUri?: string;
}

export interface RecipeStepInput {
  id: string;
  title?: string;
  description: string;
  imageUri?: string;
}

export interface RecipeInput {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  totalTimeMinutes?: number;
  servings?: number;
  category?: RecipeCategory;
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
  isUserCreated: boolean;
}

export interface RecipeRecord extends RecipeInput {
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecipeRow {
  id: string;
  title: string;
  description: string;
  image_uri: string | null;
  total_time_minutes: number | null;
  servings: number | null;
  category: RecipeCategory | null;
  is_user_created: boolean;
  created_at: Date;
  updated_at: Date;
  is_favorite: boolean;
}

interface IngredientRow {
  id: string;
  recipe_id: string;
  name: string;
  amount: string;
  image_uri: string | null;
  sort_order: number;
}

interface StepRow {
  id: string;
  recipe_id: string;
  title: string | null;
  description: string;
  image_uri: string | null;
  step_number: number;
}

function toRecipeRecord(
  row: RecipeRow,
  ingredients: IngredientRow[],
  steps: StepRow[],
): RecipeRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUri: row.image_uri ?? undefined,
    totalTimeMinutes: row.total_time_minutes ?? undefined,
    servings: row.servings ?? undefined,
    category: row.category ?? undefined,
    ingredients: ingredients
      .filter((item) => item.recipe_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        imageUri: item.image_uri ?? undefined,
      })),
    steps: steps
      .filter((item) => item.recipe_id === row.id)
      .sort((a, b) => a.step_number - b.step_number)
      .map((item) => ({
        id: item.id,
        title: item.title ?? undefined,
        description: item.description,
        imageUri: item.image_uri ?? undefined,
      })),
    isFavorite: row.is_favorite,
    isUserCreated: row.is_user_created,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function ensureScopeLists(
  client: PoolClient,
  scopeKey: string,
): Promise<void> {
  await client.query(
    `INSERT INTO recipe_lists (id, scope_key, name, list_type)
     VALUES ($1, $2, $3, 'created'), ($4, $2, $5, 'favorites')
     ON CONFLICT (scope_key, list_type) DO NOTHING`,
    [
      `${scopeKey}-created`,
      scopeKey,
      "Mis recetas",
      `${scopeKey}-favorites`,
      "Favoritas",
    ],
  );
}

async function insertRecipeGraph(
  client: PoolClient,
  recipe: RecipeInput,
  scopeKey: string,
): Promise<void> {
  await client.query(
    `INSERT INTO recipes (
      id, title, description, image_uri, total_time_minutes, servings, category,
      is_user_created, created_by_scope
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO NOTHING`,
    [
      recipe.id,
      recipe.title,
      recipe.description,
      recipe.imageUri ?? null,
      recipe.totalTimeMinutes ?? null,
      recipe.servings ?? null,
      recipe.category ?? null,
      recipe.isUserCreated,
      recipe.isUserCreated ? scopeKey : "seed",
    ],
  );

  const recipeExists = await client.query<{ id: string }>(
    "SELECT id FROM recipes WHERE id = $1",
    [recipe.id],
  );
  if (!recipeExists.rowCount) throw new Error("Recipe could not be created");

  for (const [index, item] of recipe.ingredients.entries()) {
    await client.query(
      `INSERT INTO recipe_ingredients (id, recipe_id, name, amount, image_uri, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        recipe.id,
        item.name,
        item.amount,
        item.imageUri ?? null,
        index,
      ],
    );
  }

  for (const [index, item] of recipe.steps.entries()) {
    await client.query(
      `INSERT INTO recipe_steps (id, recipe_id, title, description, image_uri, step_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        recipe.id,
        item.title ?? null,
        item.description,
        item.imageUri ?? null,
        index + 1,
      ],
    );
  }

  if (recipe.imageUri) {
    await client.query(
      `INSERT INTO recipe_images (id, recipe_id, image_uri, image_kind, sort_order)
       VALUES ($1, $2, $3, 'cover', 0)
       ON CONFLICT (id) DO NOTHING`,
      [`${recipe.id}-cover`, recipe.id, recipe.imageUri],
    );
  }
}

async function replaceRecipeChildren(
  client: PoolClient,
  recipe: RecipeInput,
): Promise<void> {
  await client.query("DELETE FROM recipe_ingredients WHERE recipe_id = $1", [
    recipe.id,
  ]);
  await client.query("DELETE FROM recipe_steps WHERE recipe_id = $1", [
    recipe.id,
  ]);
  await client.query("DELETE FROM recipe_images WHERE recipe_id = $1", [
    recipe.id,
  ]);
  await insertRecipeGraph(client, recipe, "unused");
}

export async function getRecipes(scopeKey: string): Promise<RecipeRecord[]> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO recipe_lists (id, scope_key, name, list_type)
     VALUES ($1, $2, 'Mis recetas', 'created'), ($3, $2, 'Favoritas', 'favorites')
     ON CONFLICT (scope_key, list_type) DO NOTHING`,
    [`${scopeKey}-created`, scopeKey, `${scopeKey}-favorites`],
  );
  const recipes = await pool.query<RecipeRow>(
    `SELECT r.*, EXISTS(
      SELECT 1 FROM recipe_favorites f WHERE f.recipe_id = r.id AND f.scope_key = $1
    ) AS is_favorite
    FROM recipes r
    WHERE r.is_user_created = FALSE OR r.created_by_scope = $1
    ORDER BY r.created_at DESC, r.id`,
    [scopeKey],
  );
  const ingredients = await pool.query<IngredientRow>(
    "SELECT * FROM recipe_ingredients WHERE recipe_id = ANY($1) ORDER BY sort_order",
    [recipes.rows.map((recipe) => recipe.id)],
  );
  const steps = await pool.query<StepRow>(
    "SELECT * FROM recipe_steps WHERE recipe_id = ANY($1) ORDER BY step_number",
    [recipes.rows.map((recipe) => recipe.id)],
  );
  return recipes.rows.map((row) =>
    toRecipeRecord(row, ingredients.rows, steps.rows),
  );
}

export async function createRecipe(
  scopeKey: string,
  recipe: RecipeInput,
): Promise<void> {
  await withTransaction(async (client) => {
    await ensureScopeLists(client, scopeKey);
    await insertRecipeGraph(client, recipe, scopeKey);
    if (recipe.isUserCreated) {
      await client.query(
        `INSERT INTO recipe_list_items (list_id, recipe_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [`${scopeKey}-created`, recipe.id],
      );
    }
  });
}

export async function updateRecipe(
  scopeKey: string,
  recipe: RecipeInput,
): Promise<void> {
  await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE recipes SET title = $1, description = $2, image_uri = $3,
       total_time_minutes = $4, servings = $5, category = $6, updated_at = NOW()
       WHERE id = $7 AND is_user_created = TRUE AND created_by_scope = $8`,
      [
        recipe.title,
        recipe.description,
        recipe.imageUri ?? null,
        recipe.totalTimeMinutes ?? null,
        recipe.servings ?? null,
        recipe.category ?? null,
        recipe.id,
        scopeKey,
      ],
    );
    if (!result.rowCount)
      throw new Error("Recipe not found or not owned by this installation");
    await replaceRecipeChildren(client, recipe);
  });
}

export async function deleteRecipe(
  scopeKey: string,
  recipeId: string,
): Promise<void> {
  const result = await getPool().query(
    "DELETE FROM recipes WHERE id = $1 AND is_user_created = TRUE AND created_by_scope = $2",
    [recipeId, scopeKey],
  );
  if (!result.rowCount)
    throw new Error("Recipe not found or not owned by this installation");
}

export async function setFavorite(
  scopeKey: string,
  recipeId: string,
  isFavorite: boolean,
): Promise<void> {
  await withTransaction(async (client) => {
    await ensureScopeLists(client, scopeKey);
    if (isFavorite) {
      await client.query(
        "INSERT INTO recipe_favorites (scope_key, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [scopeKey, recipeId],
      );
      await client.query(
        "INSERT INTO recipe_list_items (list_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [`${scopeKey}-favorites`, recipeId],
      );
    } else {
      await client.query(
        "DELETE FROM recipe_favorites WHERE scope_key = $1 AND recipe_id = $2",
        [scopeKey, recipeId],
      );
      await client.query(
        "DELETE FROM recipe_list_items WHERE list_id = $1 AND recipe_id = $2",
        [`${scopeKey}-favorites`, recipeId],
      );
    }
  });
}

export async function seedRecipes(recipes: RecipeInput[]): Promise<void> {
  await withTransaction(async (client) => {
    for (const recipe of recipes) {
      await client.query(
        `UPDATE recipes SET title = $1, description = $2, image_uri = $3,
         total_time_minutes = $4, servings = $5, category = $6, updated_at = NOW()
         WHERE id = $7 AND is_user_created = FALSE`,
        [
          recipe.title,
          recipe.description,
          recipe.imageUri ?? null,
          recipe.totalTimeMinutes ?? null,
          recipe.servings ?? null,
          recipe.category ?? null,
          recipe.id,
        ],
      );
      await replaceRecipeChildren(client, recipe);
      await insertRecipeGraph(client, recipe, "seed");
    }
  });
}
