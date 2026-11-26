import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RecipeEditor } from "@/src/components/RecipeEditor";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe, RecipeDraft } from "@/src/types/recipe";

export default function CreateRecipeScreen() {
  const { t } = useTranslation(["recipes"]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createRecipe = useRecipesStore((state) => state.createRecipe);

  const handleSave = async (draft: RecipeDraft) => {
    const timestamp = new Date().toISOString();
    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      imageUri: draft.imageUri,
      imageUris: draft.imageUris,
      totalTimeMinutes: draft.totalTimeMinutes
        ? Number(draft.totalTimeMinutes)
        : undefined,
      servings: draft.servings ? Number(draft.servings) : undefined,
      category: draft.category,
      ingredients: draft.ingredients,
      steps: draft.steps,
      isFavorite: false,
      isUserCreated: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    try {
      await createRecipe(recipe);
      router.replace({ pathname: "/recipe/[id]", params: { id: recipe.id } });
    } catch {
      Alert.alert(
        t("recipes:editor.saveErrorTitle"),
        t("recipes:editor.saveErrorBody"),
      );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 18 }} className="px-5 pb-4">
        <Text className="text-[30px] font-extrabold text-foreground">
          {t("recipes:editor.createTitle")}
        </Text>
      </View>
      <RecipeEditor mode="create" onSave={handleSave} />
    </View>
  );
}
