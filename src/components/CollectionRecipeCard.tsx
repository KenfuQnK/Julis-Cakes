import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FavoriteButton } from "@/src/components/FavoriteButton";
import { RecipeImage } from "@/src/components/RecipeImage";
import { Colors } from "@/src/constants/Colors";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe, RecipeCategory } from "@/src/types/recipe";
import type { RecipeCardSize } from "@/src/utils/recipeGrid";

interface CollectionRecipeCardProps {
  recipe: Recipe;
  size: RecipeCardSize;
  featured: boolean;
  onOpen: () => void;
  onResize: () => void;
}

const categoryIcons: Record<
  RecipeCategory,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  desserts: "cupcake",
  healthy: "leaf",
  quick: "timer-outline",
  airFryer: "stove",
};

export function CollectionRecipeCard({
  recipe,
  size,
  featured,
  onOpen,
  onResize,
}: CollectionRecipeCardProps) {
  const { t } = useTranslation(["recipes"]);
  const toggleFavorite = useRecipesStore((state) => state.toggleFavorite);
  const { id, title, category, imageUri, isFavorite } = recipe;
  const healthy = category === "healthy";
  const vertical = size === "vertical";
  const resizeLabel = t("recipes:mine.cardSize.action", { title });
  const webResize =
    Platform.OS === "web"
      ? {
          onKeyDown: (event: React.KeyboardEvent) => {
            if (
              event.key === "ContextMenu" ||
              (event.shiftKey && event.key === "F10")
            ) {
              event.preventDefault();
              onResize();
            }
          },
        }
      : undefined;

  return (
    <View className="flex-1 rounded-[22px] bg-surface shadow-recipe">
      <Pressable
        onPress={onOpen}
        onLongPress={onResize}
        accessibilityRole="button"
        accessibilityLabel={t("recipes:accessibility.openRecipe", { title })}
        accessibilityActions={[{ name: "resize", label: resizeLabel }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === "resize") onResize();
        }}
        {...webResize}
        className="flex-1 overflow-hidden rounded-[22px] active:opacity-90"
      >
        <View className="relative flex-1 overflow-hidden bg-surface-alt">
          {vertical && imageUri ? (
            <Image
              source={{ uri: imageUri }}
              resizeMode="cover"
              blurRadius={12}
              className="absolute inset-0 h-full w-full opacity-80"
            />
          ) : null}
          <RecipeImage
            imageUri={imageUri}
            category={category}
            resizeMode={vertical ? "contain" : "cover"}
            className="absolute inset-0 h-full w-full"
            placeholderIconSize={36}
          />
          <Image
            source={require("@/assets/images/recipe-card-fade.png")}
            resizeMode="stretch"
            tintColor={Colors.surface}
            className="absolute inset-x-0 bottom-0"
            style={{ width: "100%", height: 32 }}
          />
          {featured ? (
            <View className="absolute bottom-2 left-2 flex-row items-center gap-1 rounded-full bg-surface px-2 py-1">
              <Ionicons name="star" size={12} color={Colors.rating} />
              <Text className="text-xs font-bold text-amber">
                {t("recipes:mine.featured")}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="min-w-0 justify-center gap-1 px-3 pb-2 pt-1">
          <Text
            numberOfLines={2}
            className={`font-extrabold leading-5 tracking-tight text-foreground ${size === "horizontal" ? "text-lg" : "text-base"}`}
          >
            {title}
          </Text>
          {!featured && category ? (
            <View
              className={`max-w-full flex-row items-center gap-1 self-start rounded-full px-2 py-0.5 ${healthy ? "bg-leaf-soft" : "bg-amber-soft"}`}
            >
              <MaterialCommunityIcons
                name={categoryIcons[category]}
                size={14}
                color={healthy ? Colors.leaf : Colors.amber}
              />
              <Text
                numberOfLines={1}
                className={`min-w-0 shrink text-xs font-semibold ${healthy ? "text-leaf" : "text-amber"}`}
              >
                {t(`recipes:categories.${category}`)}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <View className="absolute left-1.5 top-1.5">
        <FavoriteButton
          title={title}
          isFavorite={isFavorite}
          onPress={() => void toggleFavorite(id)}
          collection
        />
      </View>
    </View>
  );
}
