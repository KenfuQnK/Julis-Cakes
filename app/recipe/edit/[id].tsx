import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RecipeEditor } from "@/src/components/RecipeEditor";
import { Colors } from "@/src/constants/Colors";
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
  const deleteRecipe = useRecipesStore((state) => state.deleteRecipe);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  if (isDeleting) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={Colors.primaryDark} />
      </View>
    );
  }

  if (!recipe) return null;

  const handleSave = async (draft: RecipeDraft) => {
    try {
      await updateRecipe({
        ...recipe,
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

  const remove = async () => {
    setDeleteError(false);
    setIsDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      router.dismissTo("/recipes");
    } catch {
      setDeleteError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    const title = t("recipes:editor.deleteTitle");
    const body = t("recipes:editor.deleteBody");
    if (Platform.OS === "web") {
      if (globalThis.confirm(`${title}\n\n${body}`)) void remove();
      return;
    }
    Alert.alert(title, body, [
      { text: t("recipes:editor.deleteCancel"), style: "cancel" },
      {
        text: t("recipes:editor.deleteConfirm"),
        style: "destructive",
        onPress: () => void remove(),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="flex-row items-center gap-3 px-5 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("recipes:accessibility.back")}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          <Feather name="arrow-left" size={20} color={Colors.foreground} />
        </Pressable>
        <Text className="min-w-0 flex-1 text-[26px] font-extrabold text-foreground">
          {t("recipes:editor.editTitle")}
        </Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/recipe/cover-edit",
              params: { id: recipe.id, fromEdit: "1" },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={t("recipes:cover.edit")}
          className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft"
        >
          <Feather name="crop" size={19} color={Colors.primaryDark} />
        </Pressable>
      </View>
      <RecipeEditor
        mode="edit"
        initialRecipe={recipe}
        onSave={handleSave}
        onDelete={recipe.isUserCreated ? confirmDelete : undefined}
        deleteError={deleteError}
      />
    </View>
  );
}
