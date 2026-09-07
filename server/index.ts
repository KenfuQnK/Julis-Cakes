import "dotenv/config";

import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { getPool, runMigrations } from "./db";
import {
  createRecipe,
  deleteRecipe,
  getRecipes,
  setFavorite,
  updateRecipe,
  type RecipeInput,
} from "./recipe.repository";
import { seedRecipes } from "./recipe.repository";
import { seedRecipes as seedRecipeData } from "./seed-recipes";
import { createLogger } from "../src/utils/logger";

const log = createLogger("RecipesAPI");
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function getScopeKey(request: Request): string {
  const header = request.header("x-julis-client-id");
  return header && /^[a-zA-Z0-9._-]{8,160}$/.test(header) ? header : "default";
}

function getRecipeInput(body: unknown): RecipeInput {
  if (!body || typeof body !== "object")
    throw new Error("Invalid recipe payload");
  const payload = body as Partial<RecipeInput>;
  if (
    !payload.id ||
    !payload.title ||
    !Array.isArray(payload.ingredients) ||
    !Array.isArray(payload.steps)
  ) {
    throw new Error("Recipe requires id, title, ingredients and steps");
  }
  return {
    id: String(payload.id),
    title: String(payload.title).trim(),
    description: String(payload.description ?? "").trim(),
    imageUri: payload.imageUri ? String(payload.imageUri) : undefined,
    totalTimeMinutes: payload.totalTimeMinutes
      ? Number(payload.totalTimeMinutes)
      : undefined,
    servings: payload.servings ? Number(payload.servings) : undefined,
    category: payload.category,
    ingredients: payload.ingredients,
    steps: payload.steps,
    isUserCreated: Boolean(payload.isUserCreated),
  };
}

app.get("/health", async (_request, response, next) => {
  try {
    await getPool().query("SELECT 1");
    response.json({ ok: true, service: "julis-cakes-recipes-api" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/recipes", async (request, response, next) => {
  try {
    response.json(await getRecipes(getScopeKey(request)));
  } catch (error) {
    next(error);
  }
});

app.post("/api/recipes", async (request, response, next) => {
  try {
    const recipe = getRecipeInput(request.body);
    await createRecipe(getScopeKey(request), {
      ...recipe,
      isUserCreated: true,
    });
    response.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/recipes/:id", async (request, response, next) => {
  try {
    const recipe = getRecipeInput({
      ...request.body,
      id: request.params.id,
      isUserCreated: true,
    });
    await updateRecipe(getScopeKey(request), recipe);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/recipes/:id", async (request, response, next) => {
  try {
    await deleteRecipe(getScopeKey(request), request.params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.put("/api/recipes/:id/favorite", async (request, response, next) => {
  try {
    await setFavorite(
      getScopeKey(request),
      request.params.id,
      Boolean(request.body?.isFavorite),
    );
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    log.error("Request failed", { message });
    response
      .status(message.includes("not found") ? 404 : 500)
      .json({ error: "Request failed" });
  },
);

export async function startServer(): Promise<void> {
  await runMigrations();
  await seedRecipes(
    seedRecipeData.map((recipe) => ({ ...recipe, isFavorite: false })),
  );
  const port = Number(process.env.PORT ?? 8791);
  app.listen(port, () => log.info("Recipes API listening", { port }));
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    log.error("Could not start Recipes API", {
      message: error instanceof Error ? error.message : "unknown",
    });
    process.exitCode = 1;
  });
}

export { app };
