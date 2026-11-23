import type { Recipe } from "@/src/types/recipe";

import * as recipesService from "@/src/services/recipes.service";

import { useRecipeCardSizesStore } from "./recipeCardSizes.store";
import { useRecipesStore } from "./recipes.store";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock("@/src/services/recipes.service");

const recipe: Recipe = {
  id: "test-recipe",
  title: "Receta de prueba",
  description: "Descripción",
  ingredients: [],
  steps: [],
  isFavorite: false,
  isUserCreated: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("useRecipesStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRecipesStore.setState({ recipes: [], initialized: false, error: null });
    jest.mocked(recipesService.fetchRecipes).mockResolvedValue([]);
    jest.mocked(recipesService.createRecipe).mockResolvedValue(undefined);
    jest.mocked(recipesService.updateRecipe).mockResolvedValue(undefined);
    jest.mocked(recipesService.deleteRecipe).mockResolvedValue(undefined);
    jest.mocked(recipesService.setFavorite).mockResolvedValue(undefined);
  });

  it("crea y actualiza una receta", async () => {
    jest
      .mocked(recipesService.fetchRecipes)
      .mockResolvedValueOnce([recipe])
      .mockResolvedValueOnce([{ ...recipe, title: "Título actualizado" }]);

    await useRecipesStore.getState().createRecipe(recipe);
    expect(useRecipesStore.getState().recipes[0]).toEqual(recipe);

    await useRecipesStore
      .getState()
      .updateRecipe({ ...recipe, title: "Título actualizado" });
    expect(useRecipesStore.getState().recipes[0]?.title).toBe(
      "Título actualizado",
    );
  });

  it("marca favoritos y elimina una receta", async () => {
    jest
      .mocked(recipesService.fetchRecipes)
      .mockResolvedValueOnce([{ ...recipe, isFavorite: true }])
      .mockResolvedValueOnce([]);

    useRecipesStore.setState({ recipes: [recipe] });
    useRecipeCardSizesStore.getState().setSize(recipe.id, "vertical");
    await useRecipesStore.getState().toggleFavorite(recipe.id);
    expect(useRecipesStore.getState().recipes[0]?.isFavorite).toBe(true);
    expect(useRecipeCardSizesStore.getState().sizes[recipe.id]).toBe(
      "vertical",
    );

    await useRecipesStore.getState().deleteRecipe(recipe.id);
    expect(useRecipesStore.getState().recipes).toHaveLength(0);
    expect(useRecipeCardSizesStore.getState().sizes[recipe.id]).toBeUndefined();
  });

  it("revierte una creación cuando la API falla y propaga el error", async () => {
    const error = new Error("API unavailable");
    jest.mocked(recipesService.createRecipe).mockRejectedValueOnce(error);

    await expect(
      useRecipesStore.getState().createRecipe(recipe),
    ).rejects.toThrow("API unavailable");

    expect(useRecipesStore.getState().recipes).toEqual([]);
    expect(useRecipesStore.getState().error).toBe("API unavailable");
  });
});
