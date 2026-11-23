import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FavoriteButton } from "@/src/components/FavoriteButton";
import { RecipeImage } from "@/src/components/RecipeImage";
import { Colors } from "@/src/constants/Colors";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe, RecipeCategory } from "@/src/types/recipe";

interface CollectionRecipeCardProps {
  recipe: Recipe;
  featured: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
  featured,
  onOpen,
  onEdit,
  onDelete,
}: CollectionRecipeCardProps) {
  const { t } = useTranslation(["recipes"]);
  const toggleFavorite = useRecipesStore((state) => state.toggleFavorite);
  const [actionsOpen, setActionsOpen] = useState(false);
  const { id, title, category, imageUri, isFavorite, isUserCreated } = recipe;
  const healthy = category === "healthy";

  return (
    <View
      className={`relative rounded-[22px] bg-surface shadow-recipe ${featured ? "mb-2" : ""}`}
    >
      <View className="relative">
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={t("recipes:accessibility.openRecipe", { title })}
          className={`overflow-hidden rounded-[22px] active:opacity-90 ${featured ? "" : "min-h-[160px] flex-row"}`}
        >
          <View
            className={`overflow-hidden ${featured ? "aspect-[2.44]" : "w-[65%] self-stretch rounded-[18px]"}`}
          >
            <RecipeImage
              imageUri={imageUri}
              category={category}
              className="absolute inset-0 h-full w-full"
            />
          </View>
          {featured ? (
            <View className="absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5">
              <Ionicons name="star" size={14} color={Colors.rating} />
              <Text className="text-xs font-bold text-amber">
                {t("recipes:mine.featured")}
              </Text>
            </View>
          ) : null}
          <View
            className={`min-w-0 justify-between ${featured ? "min-h-12 px-4 py-2.5" : "flex-1 gap-2 py-2 pl-3 pr-1"}`}
          >
            <Text
              numberOfLines={featured ? 2 : 3}
              className={`font-extrabold text-foreground ${featured ? "text-2xl leading-7 tracking-tight" : "mr-10 text-base leading-5 tracking-tight"} ${featured && isUserCreated ? "mr-8" : ""}`}
            >
              {title}
            </Text>
            {!featured && category ? (
              <View
                className={`max-w-full flex-row items-center gap-1 self-start rounded-full px-2 py-1 ${healthy ? "bg-leaf-soft" : "bg-amber-soft"} ${isUserCreated ? "mr-9" : "mr-1"}`}
              >
                <MaterialCommunityIcons
                  name={categoryIcons[category]}
                  size={15}
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

        <View
          className={`absolute ${featured ? "left-3 top-3" : "left-1.5 top-1.5"}`}
        >
          <FavoriteButton
            title={title}
            isFavorite={isFavorite}
            onPress={() => void toggleFavorite(id)}
            collection
            light={featured}
          />
        </View>

        {isUserCreated ? (
          <Pressable
            onPress={() => setActionsOpen(!actionsOpen)}
            accessibilityRole="button"
            accessibilityLabel={t("recipes:mine.actions", { title })}
            accessibilityState={{ expanded: actionsOpen }}
            className={`absolute bottom-0 right-1.5 h-11 w-11 items-center justify-center rounded-full active:bg-surface-alt ${actionsOpen ? "bg-surface-alt" : ""}`}
          >
            <Feather name="more-horizontal" size={17} color={Colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {isUserCreated && actionsOpen ? (
        <View className="min-h-[46px] flex-row justify-end gap-2 border-t border-border px-2">
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={t("recipes:mine.editLabel", { title })}
            className="min-h-[44px] flex-row items-center gap-1.5 px-2"
          >
            <Feather name="edit-2" size={14} color={Colors.muted} />
            <Text className="text-sm font-semibold text-muted">
              {t("recipes:common.edit")}
            </Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={t("recipes:mine.deleteLabel", { title })}
            className="min-h-[44px] flex-row items-center gap-1.5 px-2"
          >
            <Feather name="trash-2" size={14} color={Colors.primaryDark} />
            <Text className="text-sm font-semibold text-primary-dark">
              {t("recipes:common.remove")}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
