import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "@/src/constants/Colors";

interface FavoriteButtonProps {
  isFavorite: boolean;
  title: string;
  onPress: () => void;
  light?: boolean;
}

export function FavoriteButton({
  isFavorite,
  title,
  onPress,
  light = false,
}: FavoriteButtonProps) {
  const { t } = useTranslation(["recipes"]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(
        isFavorite
          ? "recipes:accessibility.toggleFavoriteOn"
          : "recipes:accessibility.toggleFavoriteOff",
        { title },
      )}
      className="h-11 w-11 items-center justify-center rounded-full bg-white/90 active:opacity-70"
    >
      <FontAwesome
        name={isFavorite ? "heart" : "heart-o"}
        size={21}
        color={
          isFavorite ? Colors.primary : light ? Colors.white : Colors.foreground
        }
      />
    </Pressable>
  );
}
