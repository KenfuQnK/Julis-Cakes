import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RecipeEditor } from "@/src/components/RecipeEditor";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { RecipeDraft } from "@/src/types/recipe";

export default function EditRecipeScreen() {
  const { t } = useTranslation(["recipes"]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const recipe = useRecipesStore((state) =>
    state.recipes.find((item) => item.id === id),
  );
  const updateRecipe = useRecipesStore((state) => state.updateRecipe);

  if (!recipe) return null;

  const handleSave = async (draft: RecipeDraft) => {
    try {
      await updateRecipe({
        ...recipe,
        title: draft.title.trim(),
        description: draft.description.trim(),
        imageUri: draft.imageUri,
        totalTimeMinutes: draft.totalTimeMinutes
          ? Number(draft.totalTimeMinutes)
          : undefined,
        servings: draft.servings ? Number(draft.servings) : undefined,
        category: draft.category,
        ingredients: draft.ingredients,
        steps: draft.steps,
        updatedAt: new Date().toISOString(),
      });
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
          {t("recipes:editor.editTitle")}
        </Text>
      </View>
      <RecipeEditor mode="edit" initialRecipe={recipe} onSave={handleSave} />
    </View>
  );
}
