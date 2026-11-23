import { useRouter } from "expo-router";
import { memo } from "react";

import { RecipeCover } from "@/src/components/RecipeCover";
import { useRecipeCoverImage } from "@/src/hooks/useRecipeCoverImage";
import { useRecipeCoversStore } from "@/src/stores/recipeCovers.store";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe } from "@/src/types/recipe";
import {
  DEFAULT_RECIPE_COVER,
  getRecipeCoverHeight,
} from "@/src/utils/recipeCover";

interface RecipeCoverRowProps {
  recipe: Recipe;
  width: number;
  featured: boolean;
}

export const RecipeCoverRow = memo(function RecipeCoverRow({
  recipe,
  width,
  featured,
}: RecipeCoverRowProps) {
  const router = useRouter();
  const settings = useRecipeCoversStore(
    (state) => state.covers[recipe.id] ?? DEFAULT_RECIPE_COVER,
  );
  const toggleFavorite = useRecipesStore((state) => state.toggleFavorite);
  const imageSize = useRecipeCoverImage(recipe.imageUri);

  return (
    <RecipeCover
      recipe={recipe}
      frame={{ width, height: getRecipeCoverHeight(width) }}
      imageSize={imageSize}
      settings={settings}
      featured={featured}
      onOpen={() =>
        router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })
      }
      onFavorite={() => void toggleFavorite(recipe.id)}
      onMenu={() =>
        router.push({
          pathname: "/recipe/cover-menu",
          params: { id: recipe.id, ...(featured ? { featured: "1" } : {}) },
        })
      }
    />
  );
});
