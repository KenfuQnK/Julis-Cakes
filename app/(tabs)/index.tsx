import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryChip } from "@/src/components/CategoryChip";
import { Button } from "@/src/components/Button";
import { RecipeCard } from "@/src/components/RecipeCard";
import { RecipeHeroCard } from "@/src/components/RecipeHeroCard";
import { SearchInput } from "@/src/components/SearchInput";
import { SectionHeader } from "@/src/components/SectionHeader";
import { Colors } from "@/src/constants/Colors";
import type { RecipeCategory } from "@/src/types/recipe";
import { useRecipesStore } from "@/src/stores/recipes.store";

export default function Home() {
  const { t } = useTranslation(["recipes"]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const recipes = useRecipesStore((state) => state.recipes);
  const isLoading = useRecipesStore((state) => state.isLoading);
  const error = useRecipesStore((state) => state.error);
  const initializeRecipes = useRecipesStore((state) => state.initialize);
  const [selectedCategory, setSelectedCategory] = useState<
    RecipeCategory | "all"
  >("all");

  const filteredRecipes =
    selectedCategory === "all"
      ? recipes
      : recipes.filter((recipe) => recipe.category === selectedCategory);
  const featuredRecipe = filteredRecipes[0] ?? recipes[0];
  const categories: (RecipeCategory | "all")[] = [
    "all",
    "desserts",
    "healthy",
    "quick",
  ];
  const categoryCards: RecipeCategory[] = [
    "desserts",
    "healthy",
    "quick",
    "airFryer",
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingTop: insets.top + 18 }} className="px-5">
          <View className="mb-6 flex-row items-end justify-between">
            <View>
              <Text className="text-[28px] font-extrabold tracking-tight text-foreground">
                {t("recipes:brand")}
              </Text>
              <Text className="mt-1 text-[15px] text-muted">
                {t("recipes:home.subtitle")}
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
              <FontAwesome
                name="birthday-cake"
                size={20}
                color={Colors.primary}
              />
            </View>
          </View>

          <SearchInput
            value=""
            onChangeText={() => undefined}
            onPress={() => router.push("/search")}
            placeholder={t("recipes:home.searchPlaceholder")}
            clearLabel={t("recipes:search.clear")}
          />

          {error ? (
            <View className="mt-6 rounded-2xl border border-error/30 bg-error/10 p-4">
              <Text className="text-base font-bold text-foreground">
                {t("recipes:home.loadErrorTitle")}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-muted">
                {t("recipes:home.loadErrorBody")}
              </Text>
              <Button
                title={isLoading ? "…" : t("recipes:home.retry")}
                variant="secondary"
                onPress={() => {
                  void initializeRecipes();
                }}
                className="mt-3"
              />
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-1 mt-4"
          >
            <View className="flex-row gap-2 px-1">
              {categories.map((category) => (
                <CategoryChip
                  key={category}
                  label={t(`recipes:categories.${category}`)}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </View>
          </ScrollView>

          {featuredRecipe ? (
            <View className="mt-8">
              <SectionHeader title={t("recipes:home.featured")} />
              <RecipeHeroCard
                recipe={featuredRecipe}
                onPress={() =>
                  router.push({
                    pathname: "/recipe/[id]",
                    params: { id: featuredRecipe.id },
                  })
                }
              />
            </View>
          ) : null}

          <View className="mt-8">
            <SectionHeader
              title={t("recipes:home.popular")}
              actionLabel={t("recipes:home.seeAll")}
              onAction={() => router.push("/search")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-1"
            >
              <View className="flex-row gap-3 px-1">
                {filteredRecipes.slice(0, 5).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    horizontal
                    onPress={() =>
                      router.push({
                        pathname: "/recipe/[id]",
                        params: { id: recipe.id },
                      })
                    }
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="mt-8">
            <SectionHeader title={t("recipes:home.categories")} />
            <View className="flex-row flex-wrap gap-3">
              {categoryCards.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  accessibilityRole="button"
                  className="h-28 w-[48%] justify-end overflow-hidden rounded-[20px] bg-surface-alt p-4 active:opacity-80"
                >
                  <FontAwesome
                    name={
                      category === "healthy"
                        ? "leaf"
                        : category === "quick"
                          ? "bolt"
                          : category === "airFryer"
                            ? "fire"
                            : "birthday-cake"
                    }
                    size={22}
                    color={Colors.primary}
                  />
                  <Text className="mt-2 text-base font-bold text-foreground">
                    {t(`recipes:categories.${category}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-8 flex-row items-center rounded-[20px] bg-primary-soft p-5">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white">
              <FontAwesome name="heart" size={21} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-base font-bold text-foreground">
                {t("recipes:home.welcome")}
              </Text>
              <Text className="text-sm leading-5 text-muted">
                {t("recipes:home.subtitle")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
