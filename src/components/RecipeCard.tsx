import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FavoriteButton } from "@/src/components/FavoriteButton";
import { RecipeImage } from "@/src/components/RecipeImage";
import { RecipeMetadata } from "@/src/components/RecipeMetadata";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe } from "@/src/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  horizontal?: boolean;
}

export function RecipeCard({
  recipe,
  onPress,
  horizontal = false,
}: RecipeCardProps) {
  const { t } = useTranslation(["recipes"]);
  const toggleFavorite = useRecipesStore((state) => state.toggleFavorite);
  const categoryLabel = recipe.category
    ? t(`recipes:categories.${recipe.category}`)
    : "";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("recipes:accessibility.openRecipe", {
        title: recipe.title,
      })}
      className={`${horizontal ? "w-[238px]" : "mb-4 w-full"} overflow-hidden rounded-[20px] bg-surface active:opacity-90`}
    >
      <View className="relative h-[154px]">
        <RecipeImage
          imageUri={recipe.imageUri}
          localImage={recipe.localImage}
          category={recipe.category}
          className="h-full w-full"
        />
        <View className="absolute right-3 top-3">
          <FavoriteButton
            title={recipe.title}
            isFavorite={recipe.isFavorite}
            onPress={() => toggleFavorite(recipe.id)}
          />
        </View>
      </View>
      <View className="p-4">
        <Text
          numberOfLines={2}
          className="mb-2 text-[17px] font-bold leading-5 text-foreground"
        >
          {recipe.title}
        </Text>
        <View className="flex-row items-center justify-between">
          <RecipeMetadata totalTimeMinutes={recipe.totalTimeMinutes} />
          {categoryLabel ? (
            <Text className="text-xs font-semibold text-muted">
              {categoryLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
