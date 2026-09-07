import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { CategoryChip } from "@/src/components/CategoryChip";
import { EmptyState } from "@/src/components/EmptyState";
import { RecipeCard } from "@/src/components/RecipeCard";
import { SearchInput } from "@/src/components/SearchInput";
import { useRecipesStore } from "@/src/stores/recipes.store";
import { searchRecipes, type RecipeSearchMode } from "@/src/utils/recipeSearch";

export default function SearchScreen() {
  const { t } = useTranslation(["recipes"]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recipes = useRecipesStore((state) => state.recipes);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<RecipeSearchMode>("all");

  const filteredRecipes = useMemo(
    () => searchRecipes(recipes, query, mode),
    [mode, query, recipes],
  );
  const modes: RecipeSearchMode[] = ["all", "recipes", "ingredients"];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingTop: insets.top + 18 }} className="px-5">
          <Text className="mb-1 text-[30px] font-extrabold text-foreground">
            {t("recipes:search.title")}
          </Text>
          <Text className="mb-6 text-[15px] text-muted">
            {t("recipes:home.subtitle")}
          </Text>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery("")}
            placeholder={t("recipes:search.placeholder")}
            clearLabel={t("recipes:search.clear")}
            autoFocus
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-1 mt-4"
          >
            <View className="flex-row gap-2 px-1">
              {modes.map((item) => (
                <CategoryChip
                  key={item}
                  label={t(`recipes:search.${item}`)}
                  selected={mode === item}
                  onPress={() => setMode(item)}
                />
              ))}
            </View>
          </ScrollView>

          <View className="mb-3 mt-8 flex-row items-center justify-between">
            <Text className="text-[22px] font-bold text-foreground">
              {t("recipes:search.results")}
            </Text>
            <Text className="text-sm font-semibold text-muted">
              {filteredRecipes.length}
            </Text>
          </View>

          {filteredRecipes.length ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() =>
                  router.push({
                    pathname: "/recipe/[id]",
                    params: { id: recipe.id },
                  })
                }
              />
            ))
          ) : (
            <EmptyState
              title={t("recipes:search.emptyTitle")}
              body={t("recipes:search.emptyBody")}
            />
          )}

          {query ? (
            <Pressable
              onPress={() => setQuery("")}
              className="mt-2 min-h-[44px] items-center justify-center"
            >
              <Text className="text-sm font-bold text-primary">
                {t("recipes:search.clear")}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
