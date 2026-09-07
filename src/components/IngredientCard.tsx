import { Text, View } from "react-native";

import { RecipeImage } from "@/src/components/RecipeImage";
import { RecipeImagePlaceholder } from "@/src/components/RecipeImagePlaceholder";
import type { Ingredient } from "@/src/types/recipe";

interface IngredientCardProps {
  ingredient: Ingredient;
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  return (
    <View className="min-h-[148px] flex-1 overflow-hidden rounded-2xl bg-surface">
      {ingredient.imageUri || ingredient.localImage ? (
        <RecipeImage
          imageUri={ingredient.imageUri}
          localImage={ingredient.localImage}
          className="h-20 w-full"
        />
      ) : (
        <RecipeImagePlaceholder className="h-20 w-full" iconSize={23} />
      )}
      <View className="p-3">
        <Text className="mb-1 text-sm font-bold text-primary">
          {ingredient.amount}
        </Text>
        <Text
          numberOfLines={2}
          className="text-sm font-semibold leading-5 text-foreground"
        >
          {ingredient.name}
        </Text>
      </View>
    </View>
  );
}
