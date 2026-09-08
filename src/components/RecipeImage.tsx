import { Image, View } from "react-native";

import { RecipeImagePlaceholder } from "@/src/components/RecipeImagePlaceholder";
import type { RecipeCategory } from "@/src/types/recipe";

interface RecipeImageProps {
  imageUri?: string;
  category?: RecipeCategory;
  className?: string;
  placeholderIconSize?: number;
}

export function RecipeImage({
  imageUri,
  category,
  className = "",
  placeholderIconSize,
}: RecipeImageProps) {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        resizeMode="cover"
        className={className}
      />
    );
  }

  return (
    <View className={className}>
      <RecipeImagePlaceholder
        category={category}
        iconSize={placeholderIconSize}
        className="h-full w-full"
      />
    </View>
  );
}
