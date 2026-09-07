import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import type { Recipe } from "@/src/types/recipe";
import { createLogger } from "@/src/utils/logger";

const CLIENT_SCOPE_KEY = "@julis_cakes_client_scope";
const log = createLogger("RecipesAPIClient");
let cachedScopeKey: string | undefined;

function createScopeKey(): string {
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

async function getScopeKey(): Promise<string> {
  if (cachedScopeKey) return cachedScopeKey;
  const stored = await AsyncStorage.getItem(CLIENT_SCOPE_KEY);
  cachedScopeKey = stored ?? createScopeKey();
  if (!stored) await AsyncStorage.setItem(CLIENT_SCOPE_KEY, cachedScopeKey);
  return cachedScopeKey;
}

function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const port = process.env.EXPO_PUBLIC_API_PORT ?? "8791";
  const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${host}:${port}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const scopeKey = await getScopeKey();
  const url = `${getApiBaseUrl()}${path}`;
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-julis-client-id": scopeKey,
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok)
      throw new Error(`Recipes API request failed (${response.status})`);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    log.error("Recipe API request failed", {
      path,
      message: error instanceof Error ? error.message : "unknown",
    });
    throw error instanceof Error
      ? error
      : new Error(`Unable to connect to the recipes API at ${url}`);
  }
}

export async function fetchRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>("/api/recipes");
}

export async function createRecipe(recipe: Recipe): Promise<void> {
  await request("/api/recipes", {
    method: "POST",
    body: JSON.stringify(recipe),
  });
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  await request(`/api/recipes/${encodeURIComponent(recipe.id)}`, {
    method: "PATCH",
    body: JSON.stringify(recipe),
  });
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await request(`/api/recipes/${encodeURIComponent(recipeId)}`, {
    method: "DELETE",
  });
}

export async function setFavorite(
  recipeId: string,
  isFavorite: boolean,
): Promise<void> {
  await request(`/api/recipes/${encodeURIComponent(recipeId)}/favorite`, {
    method: "PUT",
    body: JSON.stringify({ isFavorite }),
  });
}
