import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  Pressable,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { FavoriteButton } from "@/src/components/FavoriteButton";
import { RecipeCoverMask } from "@/src/components/RecipeCoverMask";
import { RecipeImage } from "@/src/components/RecipeImage";
import { Colors } from "@/src/constants/Colors";
import type { Recipe } from "@/src/types/recipe";
import {
  getRecipeCoverLayout,
  type CoverSize,
  type RecipeCoverSettings,
} from "@/src/utils/recipeCover";

interface RecipeCoverProps {
  recipe: Recipe;
  frame: CoverSize;
  imageSize?: CoverSize;
  settings: RecipeCoverSettings;
  featured: boolean;
  onOpen?: () => void;
  onFavorite?: () => void;
}

const titleShadow: TextStyle & { textShadow?: string } =
  Platform.OS === "web"
    ? { textShadow: "0 1px 5px rgba(0,0,0,0.8)" }
    : {
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
      };

function getEdgeMask(
  frame: CoverSize,
  layout: ReturnType<typeof getRecipeCoverLayout>,
) {
  const horizontal = layout.width < frame.width;
  const start = horizontal ? layout.left : layout.top;
  const size = horizontal ? layout.width : layout.height;
  const extent = horizontal ? frame.width : frame.height;
  const leading = start > 0.5 ? "transparent, black 14%" : "black 0%";
  const trailing =
    start + size < extent - 0.5 ? "black 86%, transparent" : "black 100%";
  return `linear-gradient(${horizontal ? 90 : 180}deg, ${leading}, ${trailing})`;
}

export function RecipeCover({
  recipe,
  frame,
  imageSize,
  settings,
  featured,
  onOpen,
  onFavorite,
}: RecipeCoverProps) {
  const { t } = useTranslation(["recipes"]);
  const [failedUri, setFailedUri] = useState<string>();
  const { title, imageUri, category, isFavorite } = recipe;
  const source =
    imageUri && imageUri !== failedUri ? { uri: imageUri } : undefined;
  const layout =
    imageSize && source && frame.width > 0
      ? getRecipeCoverLayout(frame, imageSize, settings)
      : undefined;
  const right = settings.titleSide === "right";
  const gradient = `linear-gradient(${right ? 270 : 90}deg, rgba(18, 10, 5, ${Math.min(settings.shade + 0.06, 1)}) 0%, rgba(18, 10, 5, ${settings.shade}) 47%, rgba(18, 10, 5, 0) 76%)`;
  const shade: ViewStyle & { backgroundImage?: string } =
    Platform.OS === "web"
      ? { backgroundImage: gradient }
      : { experimental_backgroundImage: gradient };
  const imageStyle = layout
    ? {
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
      }
    : undefined;
  const sharpImage = source ? (
    <Image
      source={source}
      resizeMode="cover"
      fadeDuration={0}
      {...{ draggable: false }}
      onError={() => setFailedUri(imageUri)}
      className={layout ? "absolute" : "absolute inset-0 h-full w-full"}
      style={imageStyle}
    />
  ) : null;

  return (
    <View
      className="relative overflow-hidden bg-surface-alt"
      style={{ height: frame.height }}
    >
      {source ? (
        <>
          {layout?.blurred ? (
            <Image
              source={source}
              resizeMode="cover"
              blurRadius={18}
              fadeDuration={0}
              {...{ draggable: false }}
              className="absolute inset-0 h-full w-full"
              style={{ transform: [{ scale: 1.14 }] }}
            />
          ) : null}
          {layout?.blurred ? (
            <RecipeCoverMask
              gradient={getEdgeMask(frame, layout)}
              layout={layout}
              interactive={!onOpen}
            >
              {sharpImage}
            </RecipeCoverMask>
          ) : (
            sharpImage
          )}
        </>
      ) : (
        <RecipeImage category={category} className="absolute inset-0" />
      )}
      <View
        className="absolute inset-0"
        style={[shade, { pointerEvents: "none" }]}
      />
      {onOpen ? (
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={t("recipes:accessibility.openRecipe", { title })}
          className="absolute inset-0 active:bg-black/10"
        />
      ) : null}
      <View
        className={`absolute inset-y-0 justify-center gap-1.5 ${right ? "right-5 items-end" : "left-5 items-start"}`}
        style={{ width: "45%", pointerEvents: "none" }}
      >
        {featured ? (
          <View className="flex-row items-center gap-1 rounded-full bg-surface px-2 py-0.5">
            <Ionicons name="star" size={11} color={Colors.rating} />
            <Text numberOfLines={1} className="text-xs font-bold text-amber">
              {t("recipes:mine.featured")}
            </Text>
          </View>
        ) : null}
        <Text
          numberOfLines={4}
          className={`font-black tracking-tight text-white ${right ? "text-right" : "text-left"} ${frame.width >= 590 ? "text-3xl leading-8" : "text-[23px] leading-[24px]"}`}
          style={titleShadow}
        >
          {title}
        </Text>
      </View>
      <View
        className={`absolute inset-y-2 justify-between ${right ? "left-1" : "right-1"}`}
        style={{ pointerEvents: onOpen ? "box-none" : "none" }}
      >
        <FavoriteButton
          title={title}
          isFavorite={isFavorite}
          onPress={onFavorite}
          cover
        />
      </View>
    </View>
  );
}
