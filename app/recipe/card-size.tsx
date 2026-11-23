import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { Colors } from "@/src/constants/Colors";
import { useRecipeCardSizesStore } from "@/src/stores/recipeCardSizes.store";
import { useRecipesStore } from "@/src/stores/recipes.store";
import { RECIPE_CARD_SIZES, type RecipeCardSize } from "@/src/utils/recipeGrid";

const options = Object.entries(RECIPE_CARD_SIZES) as [
  RecipeCardSize,
  (typeof RECIPE_CARD_SIZES)[RecipeCardSize],
][];

export default function RecipeCardSizeModal() {
  const { t } = useTranslation(["recipes"]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipesStore((state) =>
    state.recipes.find((item) => item.id === id),
  );
  const selectedSize = useRecipeCardSizesStore(
    (state) => state.sizes[id] ?? "square",
  );
  const setSize = useRecipeCardSizesStore((state) => state.setSize);
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/recipes");
  const title = t("recipes:mine.cardSize.title");
  const closeLabel = t("recipes:common.close");

  return (
    <View className="flex-1 items-center justify-center px-4">
      <Pressable
        onPress={close}
        accessible={false}
        focusable={false}
        className="absolute inset-0 bg-black/40"
      />
      <View
        accessibilityViewIsModal
        aria-modal
        role="dialog"
        accessibilityLabel={title}
        className="w-full max-w-sm gap-3 rounded-[22px] bg-surface p-4 shadow-recipe"
      >
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1 pl-1">
            <Text
              accessibilityRole="header"
              className="text-lg font-extrabold text-foreground"
            >
              {title}
            </Text>
            {recipe ? (
              <Text
                numberOfLines={2}
                className="text-sm font-medium text-muted"
              >
                {recipe.title}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-alt"
          >
            <Feather name="x" size={20} color={Colors.muted} />
          </Pressable>
        </View>
        {recipe ? (
          <View accessibilityRole="radiogroup" className="flex-row gap-2">
            {options.map(([size, { colSpan, rowSpan }]) => {
              const selected = selectedSize === size;
              const label = t(`recipes:mine.cardSize.${size}`);
              const ratio = `${colSpan}:${rowSpan}`;

              return (
                <Pressable
                  key={size}
                  onPress={() => {
                    setSize(recipe.id, size);
                    close();
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={`${label} (${ratio})`}
                  aria-checked={selected}
                  className={`min-w-0 flex-1 items-center gap-1 rounded-2xl border p-2 ${selected ? "border-primary bg-primary-soft" : "border-border bg-surface active:bg-surface-alt"}`}
                >
                  <View className="relative h-12 w-full items-center justify-center">
                    <View
                      className={`rounded-md border-2 ${selected ? "border-primary-dark bg-surface" : "border-muted bg-surface-alt"}`}
                      style={{ width: 22 * colSpan, height: 22 * rowSpan }}
                    />
                    {selected ? (
                      <View className="absolute bottom-0 right-0 items-center justify-center rounded-full bg-primary-dark p-0.5">
                        <Feather name="check" size={10} color={Colors.white} />
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-center text-xs font-bold text-foreground">
                    {label}
                  </Text>
                  <Text className="text-xs text-muted">{ratio}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}
