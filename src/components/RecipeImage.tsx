import { Image, View, type ImageResizeMode } from "react-native";

import { RecipeImagePlaceholder } from "@/src/components/RecipeImagePlaceholder";
import type { RecipeCategory } from "@/src/types/recipe";

interface RecipeImageProps {
  imageUri?: string;
  category?: RecipeCategory;
  className?: string;
  placeholderIconSize?: number;
  resizeMode?: ImageResizeMode;
}

export function RecipeImage({
  imageUri,
  category,
  className = "",
  placeholderIconSize,
  resizeMode = "cover",
}: RecipeImageProps) {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        resizeMode={resizeMode}
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
