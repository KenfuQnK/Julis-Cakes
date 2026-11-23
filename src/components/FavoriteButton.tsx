import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "@/src/constants/Colors";

interface FavoriteButtonProps {
  isFavorite: boolean;
  title: string;
  onPress?: () => void;
  light?: boolean;
  collection?: boolean;
  cover?: boolean;
}

export function FavoriteButton({
  isFavorite,
  title,
  onPress,
  light = false,
  collection = false,
  cover = false,
}: FavoriteButtonProps) {
  const { t } = useTranslation(["recipes"]);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      focusable={Boolean(onPress)}
      hitSlop={collection ? 6 : undefined}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      accessibilityLabel={t(
        isFavorite
          ? "recipes:accessibility.toggleFavoriteOn"
          : "recipes:accessibility.toggleFavoriteOff",
        { title },
      )}
      className={`items-center justify-center rounded-full active:opacity-60 ${cover ? (isFavorite ? "h-11 w-11 bg-surface" : "h-11 w-11 border border-white bg-black/35") : collection ? (isFavorite ? "h-8 w-8 bg-surface/80" : "h-8 w-8 bg-surface/55") : "h-8 w-8 bg-white/80"}`}
    >
      {collection || cover ? (
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={cover ? 23 : 19}
          color={
            isFavorite
              ? Colors.primaryDark
              : cover
                ? Colors.white
                : Colors.foreground
          }
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
