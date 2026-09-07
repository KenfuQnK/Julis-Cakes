import { Image, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { RecipeImagePlaceholder } from "@/src/components/RecipeImagePlaceholder";
import type { RecipeCategory } from "@/src/types/recipe";

interface RecipeImageProps {
  imageUri?: string;
  localImage?: ImageSourcePropType;
  category?: RecipeCategory;
  className?: string;
  placeholderIconSize?: number;
}

export function RecipeImage({
  imageUri,
  localImage,
  category,
  className = "",
  placeholderIconSize,
}: RecipeImageProps) {
  if (imageUri || localImage) {
    return (
      <Image
        source={imageUri ? { uri: imageUri } : localImage}
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
