import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { RecipeCoverEditor } from "@/src/components/RecipeCoverEditor";
import { Colors } from "@/src/constants/Colors";
import { useRecipeCoversStore } from "@/src/stores/recipeCovers.store";
import { useRecipesStore } from "@/src/stores/recipes.store";

export default function RecipeCoverEditScreen() {
  const { t } = useTranslation(["recipes"]);
  const { id, featured, fromEdit } = useLocalSearchParams<{
    id: string;
    featured?: string;
    fromEdit?: string;
  }>();
  const router = useRouter();
  const recipe = useRecipesStore((state) =>
    state.recipes.find((item) => item.id === id),
  );
  const recipesSettled = useRecipesStore(
    (state) => state.initialized || Boolean(state.error),
  );
  const settings = useRecipeCoversStore((state) => state.covers[id]);
  const ready = useRecipeCoversStore((state) => state.ready);
  const load = useRecipeCoversStore((state) => state.load);
  const [loadError, setLoadError] = useState(false);
  const close = () =>
    fromEdit === "1" ? router.back() : router.dismissTo("/recipes-2");

  useEffect(() => {
    let active = true;
    void load().catch(() => {
      if (active) setLoadError(true);
    });
    return () => {
      active = false;
    };
  }, [load]);

  if (recipe && ready) {
    return (
      <RecipeCoverEditor
        key={id}
        recipe={recipe}
        featured={featured === "1"}
        initialSettings={settings}
        onClose={close}
      />
    );
  }

  const unavailable = !recipe && recipesSettled;
  const closeLabel = t("recipes:common.close");
  const retryLabel = t("recipes:home.retry");
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      {loadError || unavailable ? (
        <Text
          accessibilityRole="alert"
          className="text-center font-semibold text-foreground"
        >
          {t(
            unavailable
              ? "recipes:cover.unavailable"
              : "recipes:cover.loadError",
          )}
        </Text>
      ) : (
        <ActivityIndicator color={Colors.primaryDark} />
      )}
      {loadError ? (
        <Pressable
          onPress={() => {
            setLoadError(false);
            void load().catch(() => setLoadError(true));
          }}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          className="min-h-[44px] justify-center rounded-full bg-primary-soft px-4"
        >
          <Text className="font-bold text-primary-dark">{retryLabel}</Text>
        </Pressable>
      ) : null}
      <Pressable
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        className="min-h-[44px] justify-center px-4"
      >
        <Text className="font-semibold text-muted">{closeLabel}</Text>
      </Pressable>
    </View>
  );
}
