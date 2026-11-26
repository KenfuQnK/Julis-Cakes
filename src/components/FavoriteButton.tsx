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
      className={`items-center justify-center rounded-full active:opacity-60 ${cover ? "h-6 w-6 bg-black/15" : collection ? (isFavorite ? "h-5 w-5 bg-surface/80" : "h-5 w-5 bg-surface/55") : "h-5 w-5 bg-white/80"}`}
    >
      {collection || cover ? (
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={cover ? 16 : 19}
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
