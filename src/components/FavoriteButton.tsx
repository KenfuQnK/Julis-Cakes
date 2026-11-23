import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "@/src/constants/Colors";

interface FavoriteButtonProps {
  isFavorite: boolean;
  title: string;
  onPress: () => void;
  light?: boolean;
  collection?: boolean;
}

export function FavoriteButton({
  isFavorite,
  title,
  onPress,
  light = false,
  collection = false,
}: FavoriteButtonProps) {
  const { t } = useTranslation(["recipes"]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      accessibilityLabel={t(
        isFavorite
          ? "recipes:accessibility.toggleFavoriteOn"
          : "recipes:accessibility.toggleFavoriteOff",
        { title },
      )}
      className={`h-8 w-8 items-center justify-center rounded-full active:opacity-60 ${collection ? (light ? "bg-surface" : isFavorite ? "bg-primary-soft/80" : "bg-surface-alt/60") : "bg-white/90"}`}
    >
      {collection ? (
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={22}
          color={isFavorite ? Colors.primary : Colors.muted}
        />
      ) : (
        <FontAwesome
          name={isFavorite ? "heart" : "heart-o"}
          size={20}
          color={
            isFavorite
              ? Colors.primary
              : light
                ? Colors.white
                : Colors.foreground
          }
        />
      )}
    </Pressable>
  );
}
