import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { Colors } from "@/src/constants/Colors";
import { useRecipesStore } from "@/src/stores/recipes.store";

export default function RecipeCoverMenu() {
  const { t } = useTranslation(["recipes"]);
  const router = useRouter();
  const { id, featured } = useLocalSearchParams<{
    id: string;
    featured?: string;
  }>();
  const recipe = useRecipesStore((state) =>
    state.recipes.find((item) => item.id === id),
  );
  const close = () => router.dismissTo("/recipes-2");
  const title = t("recipes:cover.menu", { title: recipe?.title ?? "" });
  const edit = t("recipes:cover.edit");
  const cancel = t("recipes:common.cancel");

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
        className="w-full max-w-sm rounded-[22px] bg-surface p-3 shadow-recipe"
      >
        {recipe ? (
          <Pressable
            onPress={() =>
              router.replace({
                pathname: "/recipe/cover-edit",
                params: { id, ...(featured ? { featured } : {}) },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={edit}
            className="min-h-[48px] flex-row items-center gap-3 rounded-2xl px-3 active:bg-primary-soft"
          >
            <Feather name="crop" size={20} color={Colors.primaryDark} />
            <Text className="text-base font-bold text-foreground">{edit}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={cancel}
          className="min-h-[44px] justify-center rounded-2xl px-3 active:bg-surface-alt"
        >
          <Text className="text-base font-semibold text-muted">{cancel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
