import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryChip } from "@/src/components/CategoryChip";
import { CollectionRecipeCard } from "@/src/components/CollectionRecipeCard";
import { EmptyState } from "@/src/components/EmptyState";
import { SearchInput } from "@/src/components/SearchInput";
import { Colors } from "@/src/constants/Colors";
import { useRecipeCardSizesStore } from "@/src/stores/recipeCardSizes.store";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { RecipeCategory } from "@/src/types/recipe";
import { getRecipeGridBands, RECIPE_CARD_SIZES } from "@/src/utils/recipeGrid";
import { searchRecipes } from "@/src/utils/recipeSearch";

const MODES = [
  { id: "all", icon: "layers-outline", label: "recipes:categories.all" },
  { id: "created", icon: "pencil-outline", label: "recipes:mine.created" },
  { id: "favorites", icon: "heart-outline", label: "recipes:mine.favorites" },
] as const;

type RecipeListMode = (typeof MODES)[number]["id"];

const GRID_GAP = 10;
const LIST_PADDING = 16;

export default function MyRecipesScreen() {
  const { t } = useTranslation(["recipes"]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recipes = useRecipesStore((state) => state.recipes);
  const isLoading = useRecipesStore((state) => state.isLoading);
  const initialized = useRecipesStore((state) => state.initialized);
  const error = useRecipesStore((state) => state.error);
  const initialize = useRecipesStore((state) => state.initialize);
  const sizes = useRecipeCardSizesStore((state) => state.sizes);
  const [gridWidth, setGridWidth] = useState(0);
  const [mode, setMode] = useState<RecipeListMode>("created");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState<RecipeCategory>();

  const collection = useMemo(
    () => recipes.filter((recipe) => recipe.isUserCreated || recipe.isFavorite),
    [recipes],
  );
  const categories = Array.from(
    new Set(
      collection.flatMap((recipe) =>
        recipe.category ? [recipe.category] : [],
      ),
    ),
  );
  const filteredRecipes = useMemo(
    () =>
      searchRecipes(
        collection.filter((recipe) => {
          if (category && category !== recipe.category) return false;
          if (mode === "created") return recipe.isUserCreated;
          if (mode === "favorites") return recipe.isFavorite;
          return true;
        }),
        query,
      ),
    [category, collection, mode, query],
  );
  const hasSearchFilters = Boolean(query.trim() || category);
  const bands = useMemo(
    () => getRecipeGridBands(filteredRecipes, sizes, !hasSearchFilters),
    [filteredRecipes, hasSearchFilters, sizes],
  );
  const cellSize = Math.max(0, (gridWidth - GRID_GAP) / 2);
  const step = cellSize + GRID_GAP;
  const emptyKey = (
    { all: "All", favorites: "Favorites", created: "Created" } as const
  )[mode];

  return (
    <View className="flex-1 bg-background">
      <FlatList
        style={{ width: "100%", maxWidth: 590, alignSelf: "center" }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 22,
          paddingHorizontal: LIST_PADDING,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        data={bands}
        keyExtractor={(band) => band.cards[0].recipe.id}
        renderItem={({ item: band }) => (
          <View style={{ height: band.rows * step }}>
            {cellSize > 0 &&
              band.cards.map(({ recipe, size, featured, row, col }) => {
                const { colSpan, rowSpan } = RECIPE_CARD_SIZES[size];
                const params = { id: recipe.id };
                return (
                  <View
                    key={recipe.id}
                    className="absolute"
                    style={{
                      start: col * step,
                      top: (row - band.row) * step,
                      width: colSpan * step - GRID_GAP,
                      height: rowSpan * step - GRID_GAP,
                    }}
                  >
                    <CollectionRecipeCard
                      recipe={recipe}
                      size={size}
                      featured={featured}
                      onOpen={() =>
                        router.push({ pathname: "/recipe/[id]", params })
                      }
                      onResize={() =>
                        router.push({ pathname: "/recipe/card-size", params })
                      }
                    />
                  </View>
                );
              })}
          </View>
        )}
        ListHeaderComponent={
          <View
            className="mb-4"
            onLayout={({ nativeEvent }) =>
              setGridWidth(nativeEvent.layout.width)
            }
          >
            <View
              pointerEvents="none"
              className="absolute -right-5 -top-24 h-36 w-72 -rotate-12 rounded-[45%] bg-primary-soft"
            />
            <View
              pointerEvents="none"
              aria-hidden
              className="absolute right-[80px]  -top-[100px] h-[200px] w-[164px]"
            >
              <Image
                source={require("@/assets/images/recipe-collection-header.png")}
                resizeMode="contain"
                style={{ width: 300, height: 300 }}
              />
            </View>
            <View className="mb-3 mt-4 flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                <Text
                  accessibilityRole="header"
                  className="text-[38px] font-black leading-[44px] tracking-[-1.4px] text-foreground"
                >
                  {t("recipes:mine.title")}
                </Text>
                <View className="mt-0.5 flex-row items-center gap-2">
                  <Text className="shrink text-base font-medium leading-6 text-muted">
                    {t("recipes:home.subtitle")}
                  </Text>
                  <View
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                    className="rotate-12"
                  >
                    <Ionicons
                      name="heart-outline"
                      size={21}
                      color={Colors.primary}
                    />
                  </View>
                </View>
              </View>
              {/* <View
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
                className="h-12 w-12 items-center justify-center rounded-[18px] bg-primary-soft shadow-recipe"
              >
                <MaterialCommunityIcons
                  name="notebook-outline"
                  size={29}
                  color={Colors.primaryDark}
                />
              </View> */}
            </View>

            <SearchInput
              rounded
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
              placeholder={t("recipes:mine.searchPlaceholder")}
              clearLabel={t("recipes:search.clear")}
              trailingAction={
                <Pressable
                  onPress={() => setFiltersOpen(!filtersOpen)}
                  accessibilityRole="button"
                  accessibilityLabel={t("recipes:mine.filters")}
                  accessibilityState={{
                    expanded: filtersOpen,
                    selected: Boolean(category),
                  }}
                  className={`h-11 w-11 items-center justify-center rounded-full ${filtersOpen || category ? "bg-primary-soft" : ""}`}
                >
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={23}
                    color={category ? Colors.primaryDark : Colors.muted}
                  />
                </Pressable>
              }
            />

            {filtersOpen ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
              >
                <View className="flex-row gap-2">
                  <CategoryChip
                    label={t("recipes:mine.allCategories")}
                    selected={!category}
                    onPress={() => setCategory(undefined)}
                  />
                  {categories.map((item) => (
                    <CategoryChip
                      key={item}
                      label={t(`recipes:categories.${item}`)}
                      selected={category === item}
                      onPress={() => setCategory(item)}
                    />
                  ))}
                </View>
              </ScrollView>
            ) : null}

            <View className="mt-4 flex-row gap-2">
              {MODES.map(({ id, icon, label }) => {
                const selected = mode === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setMode(id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t(label)}
                    className={`min-h-[32px] min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-full px-1.5 py-1.5 ${selected ? "bg-primary-fill" : "bg-surface-alt active:bg-primary-soft"}`}
                  >
                    <Ionicons
                      name={icon}
                      size={21}
                      color={selected ? Colors.white : Colors.muted}
                    />
                    <Text
                      className={`shrink text-center text-sm font-bold ${selected ? "text-white" : "text-foreground"}`}
                    >
                      {t(label)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          !initialized && isLoading ? (
            <ActivityIndicator className="mt-8" color={Colors.primaryDark} />
          ) : !initialized && error ? (
            <View className="gap-3">
              <EmptyState
                title={t("recipes:home.loadErrorTitle")}
                body={t("recipes:home.loadErrorBody")}
              />
              <Pressable
                onPress={() => void initialize()}
                accessibilityRole="button"
                accessibilityLabel={t("recipes:home.retry")}
                className="min-h-[44px] items-center justify-center self-center rounded-full bg-primary-soft px-5"
              >
                <Text className="font-bold text-primary-dark">
                  {t("recipes:home.retry")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <EmptyState
              title={t(
                hasSearchFilters
                  ? "recipes:search.emptyTitle"
                  : `recipes:mine.empty${emptyKey}Title`,
              )}
              body={t(
                hasSearchFilters
                  ? "recipes:search.emptyBody"
                  : `recipes:mine.empty${emptyKey}Body`,
              )}
            />
          )
        }
      />
    </View>
  );
}
