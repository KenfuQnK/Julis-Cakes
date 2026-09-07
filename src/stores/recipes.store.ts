import { create } from "zustand";

import * as recipesService from "@/src/services/recipes.service";
import type { Recipe } from "@/src/types/recipe";
import { createLogger } from "@/src/utils/logger";

const log = createLogger("RecipesStore");

interface RecipesStore {
  recipes: Recipe[];
  isLoading: boolean;
  isSyncing: boolean;
  initialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  createRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const useRecipesStore = create<RecipesStore>((set, get) => ({
  recipes: [],
  isLoading: false,
  isSyncing: false,
  initialized: false,
  error: null,
  initialize: async () => {
    if (get().initialized || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const recipes = await recipesService.fetchRecipes();
      set({ recipes, initialized: true });
      log.info("Recipes synchronized", { count: recipes.length });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Unable to sync recipes",
      });
      log.error("Recipe synchronization failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  createRecipe: async (recipe) => {
    const previousRecipes = get().recipes;
    set((state) => ({
      recipes: [recipe, ...state.recipes],
      isSyncing: true,
      error: null,
    }));
    try {
      await recipesService.createRecipe(recipe);
      const recipes = await recipesService.fetchRecipes();
      set({ recipes });
      log.info("Recipe created and synchronized", { recipeId: recipe.id });
    } catch (error) {
      set({
        recipes: previousRecipes,
        error: error instanceof Error ? error.message : "Unable to save recipe",
      });
      log.error("Recipe creation failed", {
        recipeId: recipe.id,
        message: error instanceof Error ? error.message : "unknown",
      });
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  },
  updateRecipe: async (recipe) => {
    const previousRecipes = get().recipes;
    set((state) => ({
      recipes: state.recipes.map((item) =>
        item.id === recipe.id ? recipe : item,
      ),
      isSyncing: true,
      error: null,
    }));
    try {
      await recipesService.updateRecipe(recipe);
      const recipes = await recipesService.fetchRecipes();
      set({ recipes });
    } catch (error) {
      set({
        recipes: previousRecipes,
        error:
          error instanceof Error ? error.message : "Unable to update recipe",
      });
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  },
  deleteRecipe: async (id) => {
    const previousRecipes = get().recipes;
    set({
      recipes: previousRecipes.filter((item) => item.id !== id),
      isSyncing: true,
      error: null,
    });
    try {
      await recipesService.deleteRecipe(id);
      const recipes = await recipesService.fetchRecipes();
      set({ recipes });
    } catch (error) {
      set({
        recipes: previousRecipes,
        error:
          error instanceof Error ? error.message : "Unable to delete recipe",
      });
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  },
  toggleFavorite: async (id) => {
    const previousRecipes = get().recipes;
    const recipe = previousRecipes.find((item) => item.id === id);
    if (!recipe) return;
    const isFavorite = !recipe.isFavorite;
    set({
      recipes: previousRecipes.map((item) =>
        item.id === id ? { ...item, isFavorite } : item,
      ),
      isSyncing: true,
      error: null,
    });
    try {
      await recipesService.setFavorite(id, isFavorite);
      const recipes = await recipesService.fetchRecipes();
      set({ recipes });
    } catch (error) {
      set({
        recipes: previousRecipes,
        error:
          error instanceof Error ? error.message : "Unable to update favorite",
      });
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  },
}));
