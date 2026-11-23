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
import { askCookingAssistant, type ChatMessage } from "./ai.service";
import {
  createUploadTicket,
  isStorageConfigured,
  UPLOAD_CONTENT_TYPES,
} from "./storage";

const log = createLogger("RecipesAPI");
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function getScopeKey(request: Request): string {
  const configuredScope = process.env.JULIS_RECIPES_SCOPE_KEY;
  if (configuredScope && /^[a-zA-Z0-9._-]{8,160}$/.test(configuredScope)) {
    return configuredScope;
  }

  const header = request.header("x-julis-client-id");
  return header && /^[a-zA-Z0-9._-]{8,160}$/.test(header) ? header : "default";
}

function getRecipeInput(body: unknown): RecipeInput {
  if (!body || typeof body !== "object")
    throw new Error("Invalid recipe payload");
  const payload = body as Partial<RecipeInput>;
  if (
    !payload.id ||
    typeof payload.title !== "string" ||
    !payload.title.trim() ||
    !Array.isArray(payload.ingredients) ||
    !payload.ingredients.length ||
    !payload.ingredients.every(
      (ingredient) =>
        ingredient &&
        typeof ingredient === "object" &&
        typeof (ingredient as RecipeInput["ingredients"][number]).id ===
          "string" &&
        typeof (ingredient as RecipeInput["ingredients"][number]).name ===
          "string" &&
        Boolean(
          (ingredient as RecipeInput["ingredients"][number]).name.trim(),
        ) &&
        typeof (ingredient as RecipeInput["ingredients"][number]).amount ===
          "string" &&
        Boolean(
          (ingredient as RecipeInput["ingredients"][number]).amount.trim(),
        ),
    ) ||
    !Array.isArray(payload.steps) ||
    !payload.steps.length ||
    !payload.steps.every(
      (step) =>
        step &&
        typeof step === "object" &&
        typeof (step as RecipeInput["steps"][number]).id === "string" &&
        typeof (step as RecipeInput["steps"][number]).description ===
          "string" &&
        Boolean((step as RecipeInput["steps"][number]).description.trim()),
    )
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

function getAssistantInput(body: unknown): {
  message: string;
  history: ChatMessage[];
} {
  if (!body || typeof body !== "object")
    throw new Error("Invalid assistant payload");
  const payload = body as { message?: unknown; history?: unknown };
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message || message.length > 2_000)
    throw new Error("Invalid assistant message");
  const history = Array.isArray(payload.history)
    ? payload.history
        .filter(
          (item): item is ChatMessage =>
            Boolean(item) &&
            typeof item === "object" &&
            ((item as ChatMessage).role === "user" ||
              (item as ChatMessage).role === "assistant") &&
            typeof (item as ChatMessage).content === "string" &&
            (item as ChatMessage).content.length <= 2_000,
        )
        .slice(-8)
    : [];
  return { message, history };
}

function getUploadContentType(body: unknown): string {
  const contentType =
    body && typeof body === "object"
      ? (body as { contentType?: unknown }).contentType
      : undefined;
  if (
    typeof contentType !== "string" ||
    !UPLOAD_CONTENT_TYPES.includes(contentType)
  )
    throw new Error(
      `Invalid upload content type, expected one of ${UPLOAD_CONTENT_TYPES.join(", ")}`,
    );
  return contentType;
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
    const scopeKey = getScopeKey(request);
    const recipes = await getRecipes(scopeKey);
    log.info("[RECIPES_GET] Collection loaded", {
      scopeKey,
      count: recipes.length,
      createdCount: recipes.filter((recipe) => recipe.isUserCreated).length,
    });
    response.json(recipes);
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

app.post("/api/uploads/sign", async (request, response, next) => {
  try {
    if (!isStorageConfigured()) {
      log.warn("Upload requested but object storage is not configured");
      response.status(503).json({ error: "Image uploads are not available" });
      return;
    }
    const ticket = await createUploadTicket(
      getScopeKey(request),
      getUploadContentType(request.body),
    );
    response.json(ticket);
  } catch (error) {
    next(error);
  }
});

app.post("/api/assistant", async (request, response, next) => {
  try {
    const input = getAssistantInput(request.body);
    const scopeKey = getScopeKey(request);
    log.info("[AI_CHAT] Received complete message", { ...input, scopeKey });
    const result = await askCookingAssistant(
      input.message,
      input.history,
      await getRecipes(scopeKey),
    );
    log.info("[AI_CHAT] Sending complete message", { ...result });
    response.json(result);
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
    const status = message.includes("not found")
      ? 404
      : message.startsWith("Invalid") || message.includes("requires")
        ? 400
        : 500;
    response.status(status).json({ error: "Request failed" });
  },
);

let initializationPromise: Promise<void> | undefined;

export function initializeServer(): Promise<void> {
  initializationPromise ??= (async () => {
    await runMigrations();
    await seedRecipes(
      seedRecipeData.map((recipe) => ({ ...recipe, isFavorite: false })),
    );
  })().catch((error: unknown) => {
    initializationPromise = undefined;
    throw error;
  });
  return initializationPromise;
}

export async function startServer(): Promise<void> {
  await initializeServer();
  const port = Number(process.env.PORT ?? 8791);
  app.listen(port, () => log.info("Recipes API listening", { port }));
}

if (process.env.NODE_ENV !== "test" && process.env.VERCEL !== "1") {
  startServer().catch((error) => {
    log.error("Could not start Recipes API", {
      message: error instanceof Error ? error.message : "unknown",
    });
    process.exitCode = 1;
  });
}

export { app };
