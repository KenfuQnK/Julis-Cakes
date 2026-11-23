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
      hitSlop={collection ? 6 : undefined}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      accessibilityLabel={t(
        isFavorite
          ? "recipes:accessibility.toggleFavoriteOn"
          : "recipes:accessibility.toggleFavoriteOff",
        { title },
      )}
      className={`h-8 w-8 items-center justify-center rounded-full active:opacity-60 ${collection ? (isFavorite ? "bg-surface/80" : "bg-surface/55") : "bg-white/80"}`}
    >
      {collection ? (
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={19}
          color={isFavorite ? Colors.primaryDark : Colors.foreground}
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
