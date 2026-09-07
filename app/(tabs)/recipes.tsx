import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { CategoryChip } from "@/src/components/CategoryChip";
import { EmptyState } from "@/src/components/EmptyState";
import { RecipeCard } from "@/src/components/RecipeCard";
import { Colors } from "@/src/constants/Colors";
import { useRecipesStore } from "@/src/stores/recipes.store";

type RecipeListMode = "created" | "favorites";

export default function MyRecipesScreen() {
  const { t } = useTranslation(["recipes"]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recipes = useRecipesStore((state) => state.recipes);
  const deleteRecipe = useRecipesStore((state) => state.deleteRecipe);
  const [mode, setMode] = useState<RecipeListMode>("created");
  const filteredRecipes = recipes.filter((recipe) =>
    mode === "created" ? recipe.isUserCreated : recipe.isFavorite,
  );

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      t("recipes:editor.deleteTitle"),
      t("recipes:editor.deleteBody"),
      [
        { text: t("recipes:editor.deleteCancel"), style: "cancel" },
        {
          text: t("recipes:editor.deleteConfirm"),
          style: "destructive",
          onPress: () => deleteRecipe(id),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingTop: insets.top + 18 }} className="px-5">
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-[30px] font-extrabold text-foreground">
                {t("recipes:mine.title")}
              </Text>
              <Text className="mt-1 text-[15px] text-muted">
                {t("recipes:home.subtitle")}
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
              <FontAwesome name="book" size={19} color={Colors.primary} />
            </View>
          </View>
          <View className="mb-7 flex-row gap-2">
            <CategoryChip
              label={t("recipes:mine.created")}
              selected={mode === "created"}
              onPress={() => setMode("created")}
            />
            <CategoryChip
              label={t("recipes:mine.favorites")}
              selected={mode === "favorites"}
              onPress={() => setMode("favorites")}
            />
          </View>

          {filteredRecipes.length ? (
            filteredRecipes.map((recipe) => (
              <View key={recipe.id} className="mb-1">
                <RecipeCard
                  recipe={recipe}
                  onPress={() =>
                    router.push({
                      pathname: "/recipe/[id]",
                      params: { id: recipe.id },
                    })
                  }
                />
                {mode === "created" ? (
                  <View className="-mt-3 mb-4 flex-row justify-end gap-4 pr-3">
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/recipe/edit/[id]",
                          params: { id: recipe.id },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={t("recipes:mine.editLabel", {
                        title: recipe.title,
                      })}
                      className="min-h-[44px] flex-row items-center gap-2 px-2"
                    >
                      <FontAwesome
                        name="pencil"
                        size={14}
                        color={Colors.muted}
                      />
                      <Text className="text-sm font-bold text-muted">
                        {t("recipes:common.edit")}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => confirmDelete(recipe.id, recipe.title)}
                      accessibilityRole="button"
                      accessibilityLabel={t("recipes:mine.deleteLabel", {
                        title: recipe.title,
                      })}
                      className="min-h-[44px] flex-row items-center gap-2 px-2"
                    >
                      <FontAwesome
                        name="trash-o"
                        size={14}
                        color={Colors.error}
                      />
                      <Text className="text-sm font-bold text-error">
                        {t("recipes:common.remove")}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))
          ) : (
            <EmptyState
              title={t(
                mode === "created"
                  ? "recipes:mine.emptyCreatedTitle"
                  : "recipes:mine.emptyFavoritesTitle",
              )}
              body={t(
                mode === "created"
                  ? "recipes:mine.emptyCreatedBody"
                  : "recipes:mine.emptyFavoritesBody",
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
