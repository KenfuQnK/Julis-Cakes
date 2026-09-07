import type { Recipe } from "@/src/types/recipe";

export type RecipeSearchMode = "all" | "recipes" | "ingredients";

export function searchRecipes(
  recipes: Recipe[],
  query: string,
  mode: RecipeSearchMode = "all",
): Recipe[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return recipes;

  return recipes.filter((recipe) => {
    const recipeText =
      `${recipe.title} ${recipe.description}`.toLocaleLowerCase();
    const ingredientText = recipe.ingredients
      .map((item) => item.name)
      .join(" ")
      .toLocaleLowerCase();

    if (mode === "recipes") return recipeText.includes(normalized);
    if (mode === "ingredients") return ingredientText.includes(normalized);
    return `${recipeText} ${ingredientText}`.includes(normalized);
  });
}
