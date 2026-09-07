import FontAwesome from "@expo/vector-icons/FontAwesome";
import { View } from "react-native";

import { Colors } from "@/src/constants/Colors";
import type { RecipeCategory } from "@/src/types/recipe";

interface RecipeImagePlaceholderProps {
  category?: RecipeCategory;
  className?: string;
  iconSize?: number;
}

export function RecipeImagePlaceholder({
  category = "desserts",
  className = "",
  iconSize = 32,
}: RecipeImagePlaceholderProps) {
  const backgroundClassName = {
    desserts: "bg-primary-soft",
    healthy: "bg-surface-alt",
    quick: "bg-primary-soft",
    airFryer: "bg-surface-alt",
  }[category];

  return (
    <View
      className={`items-center justify-center ${backgroundClassName} ${className}`}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-white/70">
        <FontAwesome
          name="birthday-cake"
          size={iconSize}
          color={Colors.primary}
        />
      </View>
    </View>
  );
}
