import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FavoriteButton } from "@/src/components/FavoriteButton";
import { RecipeImage } from "@/src/components/RecipeImage";
import { RecipeMetadata } from "@/src/components/RecipeMetadata";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe } from "@/src/types/recipe";

interface RecipeHeroCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeHeroCard({ recipe, onPress }: RecipeHeroCardProps) {
  const { t } = useTranslation(["recipes"]);
  const toggleFavorite = useRecipesStore((state) => state.toggleFavorite);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("recipes:accessibility.openRecipe", {
        title: recipe.title,
      })}
      className="overflow-hidden rounded-[24px] bg-surface active:opacity-95"
    >
      <View className="h-[270px]">
        <RecipeImage
          imageUri={recipe.imageUri}
          localImage={recipe.localImage}
          category={recipe.category}
          className="h-full w-full"
          placeholderIconSize={42}
        />
        <View className="absolute inset-x-0 bottom-0 h-36 bg-black/35" />
        <View className="absolute left-4 right-4 top-4 flex-row items-start justify-between">
          <View className="rounded-full bg-white/90 px-3 py-1.5">
            <Text className="text-xs font-bold uppercase tracking-wide text-primary">
              {recipe.category
                ? t(`recipes:categories.${recipe.category}`)
                : t("recipes:categories.desserts")}
            </Text>
          </View>
          <FavoriteButton
            title={recipe.title}
            isFavorite={recipe.isFavorite}
            onPress={() => toggleFavorite(recipe.id)}
            light
          />
        </View>
        <View className="absolute bottom-4 left-4 right-4">
          <Text
            numberOfLines={2}
            className="mb-2 text-[28px] font-bold leading-8 text-white"
          >
            {recipe.title}
          </Text>
          <Text
            numberOfLines={2}
            className="mb-3 text-sm leading-5 text-white/85"
          >
            {recipe.description}
          </Text>
          <RecipeMetadata
            totalTimeMinutes={recipe.totalTimeMinutes}
            servings={recipe.servings}
            light
          />
        </View>
      </View>
    </Pressable>
  );
}
