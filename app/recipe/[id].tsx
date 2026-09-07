import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "@/src/components/Button";
import { FavoriteButton } from "@/src/components/FavoriteButton";
import { IngredientCard } from "@/src/components/IngredientCard";
import { RecipeImage } from "@/src/components/RecipeImage";
import { RecipeMetadata } from "@/src/components/RecipeMetadata";
import { StepCard } from "@/src/components/StepCard";
import { Colors } from "@/src/constants/Colors";
import { useRecipesStore } from "@/src/stores/recipes.store";

export default function RecipeDetailScreen() {
  const { t } = useTranslation(["recipes"]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipesStore((state) =>
    state.recipes.find((item) => item.id === id),
  );
  const toggleFavorite = useRecipesStore((state) => state.toggleFavorite);
  const scrollRef = useRef<ScrollView>(null);
  const [preparationY, setPreparationY] = useState(0);

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-center text-2xl font-bold text-foreground">
          {t("recipes:detail.notFoundTitle")}
        </Text>
        <Text className="mb-7 text-center text-base text-muted">
          {t("recipes:detail.notFoundBody")}
        </Text>
        <Button
          title={t("recipes:detail.goHome")}
          onPress={() => router.replace("/")}
        />
      </View>
    );
  }

  const categoryLabel = recipe.category
    ? t(`recipes:categories.${recipe.category}`)
    : "";

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View className="relative h-[340px]">
          <RecipeImage
            imageUri={recipe.imageUri}
            localImage={recipe.localImage}
            category={recipe.category}
            className="h-full w-full"
            placeholderIconSize={46}
          />
          <View className="absolute inset-x-0 top-0 h-32 bg-black/10" />
          <View className="absolute left-5 right-5 top-14 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t("recipes:accessibility.back")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/90"
            >
              <FontAwesome
                name="arrow-left"
                size={18}
                color={Colors.foreground}
              />
            </Pressable>
            <View className="flex-row gap-2">
              {recipe.isUserCreated ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/recipe/edit/[id]",
                      params: { id: recipe.id },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t("recipes:accessibility.edit")}
                  className="h-11 w-11 items-center justify-center rounded-full bg-white/90"
                >
                  <FontAwesome
                    name="pencil"
                    size={17}
                    color={Colors.foreground}
                  />
                </Pressable>
              ) : null}
              <FavoriteButton
                title={recipe.title}
                isFavorite={recipe.isFavorite}
                onPress={() => toggleFavorite(recipe.id)}
              />
            </View>
          </View>
        </View>

        <View className="px-5 pt-6">
          {categoryLabel ? (
            <Text className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">
              {categoryLabel}
            </Text>
          ) : null}
          <Text className="mb-3 text-[34px] font-extrabold leading-9 text-foreground">
            {recipe.title}
          </Text>
          <Text className="mb-5 text-[16px] leading-6 text-muted">
            {recipe.description || t("recipes:detail.noDescription")}
          </Text>
          <RecipeMetadata
            totalTimeMinutes={recipe.totalTimeMinutes}
            servings={recipe.servings}
          />

          <View className="mt-9 flex-row items-center justify-between">
            <Text className="text-[24px] font-bold text-foreground">
              {t("recipes:detail.ingredients")}
            </Text>
            <Text className="text-sm font-semibold text-muted">
              {t("recipes:detail.ingredientCount", {
                count: recipe.ingredients.length,
              })}
            </Text>
          </View>
          <View className="mt-4 flex-row flex-wrap gap-3">
            {recipe.ingredients.map((ingredient) => (
              <View key={ingredient.id} className="w-[48%]">
                <IngredientCard ingredient={ingredient} />
              </View>
            ))}
          </View>

          <View
            onLayout={(event) => setPreparationY(event.nativeEvent.layout.y)}
            className="mt-9"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[24px] font-bold text-foreground">
                {t("recipes:detail.preparation")}
              </Text>
              <Text className="text-sm font-semibold text-muted">
                {t("recipes:detail.stepCount", { count: recipe.steps.length })}
              </Text>
            </View>
            <View className="mt-4">
              {recipe.steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  number={index + 1}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </View>
          </View>

          <Button
            title={t("recipes:detail.startCooking")}
            onPress={() =>
              scrollRef.current?.scrollTo({ y: preparationY, animated: true })
            }
            className="mt-5"
          />
        </View>
      </ScrollView>
    </View>
  );
}
