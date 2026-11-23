import * as ImagePicker from "expo-image-picker";
import { useReducer, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "@/src/components/Button";
import { CategoryChip } from "@/src/components/CategoryChip";
import { RecipeImage } from "@/src/components/RecipeImage";
import { RecipeImagePlaceholder } from "@/src/components/RecipeImagePlaceholder";
import { Colors } from "@/src/constants/Colors";
import { uploadRecipeImage } from "@/src/services/imageUpload.service";
import type { Recipe, RecipeCategory, RecipeDraft } from "@/src/types/recipe";
import {
  hasRecipeValidationErrors,
  validateRecipeDraft,
  type RecipeValidationErrors,
  type RecipeValidationKey,
} from "@/src/utils/recipeValidation";

type EditorAction =
  | {
      type: "setField";
      field: keyof Omit<RecipeDraft, "ingredients" | "steps">;
      value: string;
    }
  | { type: "setImage"; imageUri?: string }
  | { type: "setCategory"; category: RecipeCategory }
  | {
      type: "updateIngredient";
      id: string;
      field: "name" | "amount";
      value: string;
    }
  | { type: "addIngredient" }
  | { type: "removeIngredient"; id: string }
  | {
      type: "updateStep";
      id: string;
      field: "title" | "description";
      value: string;
    }
  | { type: "addStep" }
  | { type: "removeStep"; id: string };

interface RecipeEditorProps {
  mode: "create" | "edit";
  initialRecipe?: Recipe;
  onSave: (draft: RecipeDraft) => void;
}

const ERROR_TRANSLATION_KEYS = {
  nameRequired: "recipes:validation.nameRequired",
  ingredientsRequired: "recipes:validation.ingredientsRequired",
  stepsRequired: "recipes:validation.stepsRequired",
  positiveTime: "recipes:validation.positiveTime",
  positiveServings: "recipes:validation.positiveServings",
  ingredientNameRequired: "recipes:validation.ingredientNameRequired",
  ingredientAmountRequired: "recipes:validation.ingredientAmountRequired",
  stepDescriptionRequired: "recipes:validation.stepDescriptionRequired",
} as const;

function buildInitialDraft(recipe?: Recipe): RecipeDraft {
  return {
    title: recipe?.title ?? "",
    description: recipe?.description ?? "",
    imageUri: recipe?.imageUri,
    totalTimeMinutes: recipe?.totalTimeMinutes?.toString() ?? "",
    servings: recipe?.servings?.toString() ?? "",
    category: recipe?.category ?? "desserts",
    ingredients: recipe?.ingredients ?? [
      { id: "ingredient-1", name: "", amount: "" },
    ],
    steps: recipe?.steps ?? [{ id: "step-1", description: "" }],
  };
}

function recipeDraftReducer(
  state: RecipeDraft,
  action: EditorAction,
): RecipeDraft {
  switch (action.type) {
    case "setField":
      return { ...state, [action.field]: action.value };
    case "setImage":
      return { ...state, imageUri: action.imageUri };
    case "setCategory":
      return { ...state, category: action.category };
    case "updateIngredient":
      return {
        ...state,
        ingredients: state.ingredients.map((item) =>
          item.id === action.id
            ? { ...item, [action.field]: action.value }
            : item,
        ),
      };
    case "addIngredient":
      return {
        ...state,
        ingredients: [
          ...state.ingredients,
          { id: `ingredient-${Date.now()}`, name: "", amount: "" },
        ],
      };
    case "removeIngredient":
      return {
        ...state,
        ingredients: state.ingredients.filter((item) => item.id !== action.id),
      };
    case "updateStep":
      return {
        ...state,
        steps: state.steps.map((item) =>
          item.id === action.id
            ? { ...item, [action.field]: action.value }
            : item,
        ),
      };
    case "addStep":
      return {
        ...state,
        steps: [...state.steps, { id: `step-${Date.now()}`, description: "" }],
      };
    case "removeStep":
      return {
        ...state,
        steps: state.steps.filter((item) => item.id !== action.id),
      };
  }
}

export function RecipeEditor({
  mode,
  initialRecipe,
  onSave,
}: RecipeEditorProps) {
  const { t } = useTranslation(["recipes"]);
  const [draft, dispatch] = useReducer(
    recipeDraftReducer,
    initialRecipe,
    buildInitialDraft,
  );
  const [errors, setErrors] = useState<RecipeValidationErrors>({
    ingredientIds: {},
    stepIds: {},
  });
  // Shown straight after picking, while the file is still on its way to the
  // bucket; `draft.imageUri` only ever holds the final remote URL.
  const [previewUri, setPreviewUri] = useState<string | undefined>(
    initialRecipe?.imageUri,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // Compression happens once, on the way out, in uploadRecipeImage.
      quality: 1,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset?.uri) return;

    setPreviewUri(asset.uri);
    setImageUploadFailed(false);
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadRecipeImage({
        uri: asset.uri,
        width: asset.width,
      });
      dispatch({ type: "setImage", imageUri: publicUrl });
      setPreviewUri(publicUrl);
    } catch {
      // A local file:// URI would be meaningless on any other device, so a
      // failed upload leaves the recipe without a photo rather than a dead link.
      dispatch({ type: "setImage", imageUri: undefined });
      setPreviewUri(undefined);
      setImageUploadFailed(true);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = () => {
    const nextErrors = validateRecipeDraft(draft);
    setErrors(nextErrors);
    if (!hasRecipeValidationErrors(nextErrors)) onSave(draft);
  };

  const errorMessage = (key?: RecipeValidationKey) =>
    key ? t(ERROR_TRANSLATION_KEYS[key]) : undefined;
  const categories: RecipeCategory[] = [
    "desserts",
    "healthy",
    "quick",
    "airFryer",
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-5">
          <Pressable
            onPress={chooseImage}
            accessibilityRole="button"
            accessibilityLabel={t("recipes:accessibility.addPhoto")}
            className="mb-7 overflow-hidden rounded-[24px]"
          >
            {previewUri ? (
              <View className="h-56">
                <RecipeImage imageUri={previewUri} className="h-full w-full" />
                <View className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2">
                  <Text className="text-sm font-bold text-foreground">
                    {isUploadingImage
                      ? t("recipes:editor.photoUploading")
                      : t("recipes:common.addPhoto")}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="h-56">
                <RecipeImagePlaceholder
                  className="h-full w-full"
                  iconSize={36}
                />
                <View className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/90 p-4">
                  <Text className="mb-1 text-base font-bold text-foreground">
                    {t("recipes:editor.photoTitle")}
                  </Text>
                  <Text className="text-sm leading-5 text-muted">
                    {t("recipes:editor.photoBody")}
                  </Text>
                  <Text className="mt-3 text-sm font-bold text-primary">
                    {t("recipes:common.addPhoto")}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
          {imageUploadFailed ? (
            <ErrorText message={t("recipes:editor.photoUploadError")} />
          ) : null}

          <EditorSectionTitle title={t("recipes:editor.information")} />
          <FieldLabel label={t("recipes:editor.name")} />
          <TextInput
            value={draft.title}
            onChangeText={(value) =>
              dispatch({ type: "setField", field: "title", value })
            }
            placeholder={t("recipes:editor.namePlaceholder")}
            placeholderTextColor={Colors.muted}
            accessibilityLabel={t("recipes:editor.name")}
            className={`mb-1 min-h-[52px] rounded-2xl border bg-surface px-4 text-base text-foreground ${errors.title ? "border-error" : "border-border"}`}
          />
          {errors.title ? (
            <ErrorText message={errorMessage(errors.title)} />
          ) : null}

          <FieldLabel label={t("recipes:editor.description")} />
          <TextInput
            value={draft.description}
            onChangeText={(value) =>
              dispatch({ type: "setField", field: "description", value })
            }
            placeholder={t("recipes:editor.descriptionPlaceholder")}
            placeholderTextColor={Colors.muted}
            multiline
            accessibilityLabel={t("recipes:editor.description")}
            className="mb-4 min-h-[96px] rounded-2xl border border-border bg-surface px-4 py-3 text-base text-foreground"
            textAlignVertical="top"
          />

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <FieldLabel label={t("recipes:editor.time")} />
              <TextInput
                value={draft.totalTimeMinutes}
                onChangeText={(value) =>
                  dispatch({
                    type: "setField",
                    field: "totalTimeMinutes",
                    value,
                  })
                }
                placeholder="0"
                placeholderTextColor={Colors.muted}
                keyboardType="number-pad"
                accessibilityLabel={t("recipes:editor.time")}
                className={`min-h-[52px] rounded-2xl border bg-surface px-4 text-base text-foreground ${errors.totalTimeMinutes ? "border-error" : "border-border"}`}
              />
              {errors.totalTimeMinutes ? (
                <ErrorText message={errorMessage(errors.totalTimeMinutes)} />
              ) : null}
            </View>
            <View className="flex-1">
              <FieldLabel label={t("recipes:editor.servings")} />
              <TextInput
                value={draft.servings}
                onChangeText={(value) =>
                  dispatch({ type: "setField", field: "servings", value })
                }
                placeholder="0"
                placeholderTextColor={Colors.muted}
                keyboardType="number-pad"
                accessibilityLabel={t("recipes:editor.servings")}
                className={`min-h-[52px] rounded-2xl border bg-surface px-4 text-base text-foreground ${errors.servings ? "border-error" : "border-border"}`}
              />
              {errors.servings ? (
                <ErrorText message={errorMessage(errors.servings)} />
              ) : null}
            </View>
          </View>

          <FieldLabel label={t("recipes:editor.category")} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-7"
          >
            <View className="flex-row gap-2">
              {categories.map((category) => (
                <CategoryChip
                  key={category}
                  label={t(`recipes:categories.${category}`)}
                  selected={draft.category === category}
                  onPress={() => dispatch({ type: "setCategory", category })}
                />
              ))}
            </View>
          </ScrollView>

          <View className="mb-3 flex-row items-center justify-between">
            <EditorSectionTitle title={t("recipes:editor.ingredients")} />
            <Text className="text-sm font-semibold text-muted">
              {draft.ingredients.length}
            </Text>
          </View>
          {errors.ingredients ? (
            <ErrorText message={errorMessage(errors.ingredients)} />
          ) : null}
          {draft.ingredients.map((item) => {
            const itemErrors = errors.ingredientIds[item.id];
            return (
              <View key={item.id} className="mb-3 rounded-2xl bg-surface p-3">
                <View className="flex-row gap-2">
                  <TextInput
                    value={item.name}
                    onChangeText={(value) =>
                      dispatch({
                        type: "updateIngredient",
                        id: item.id,
                        field: "name",
                        value,
                      })
                    }
                    placeholder={t("recipes:editor.ingredientName")}
                    placeholderTextColor={Colors.muted}
                    accessibilityLabel={t("recipes:editor.ingredientName")}
                    className={`min-h-[48px] flex-1 rounded-xl border bg-background px-3 text-sm text-foreground ${itemErrors?.name ? "border-error" : "border-border"}`}
                  />
                  <TextInput
                    value={item.amount}
                    onChangeText={(value) =>
                      dispatch({
                        type: "updateIngredient",
                        id: item.id,
                        field: "amount",
                        value,
                      })
                    }
                    placeholder={t("recipes:editor.ingredientAmount")}
                    placeholderTextColor={Colors.muted}
                    accessibilityLabel={t("recipes:editor.ingredientAmount")}
                    className={`min-h-[48px] w-[34%] rounded-xl border bg-background px-3 text-sm text-foreground ${itemErrors?.amount ? "border-error" : "border-border"}`}
                  />
                  <Pressable
                    onPress={() =>
                      dispatch({ type: "removeIngredient", id: item.id })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={t(
                      "recipes:accessibility.removeIngredient",
                    )}
                    className="h-12 w-12 items-center justify-center"
                  >
                    <Text className="text-xl text-error">×</Text>
                  </Pressable>
                </View>
                {itemErrors?.name ? (
                  <ErrorText message={errorMessage(itemErrors.name)} />
                ) : null}
                {itemErrors?.amount ? (
                  <ErrorText message={errorMessage(itemErrors.amount)} />
                ) : null}
              </View>
            );
          })}
          <Button
            title={`+ ${t("recipes:editor.addIngredient")}`}
            variant="secondary"
            onPress={() => dispatch({ type: "addIngredient" })}
            className="mb-8"
          />

          <View className="mb-3 flex-row items-center justify-between">
            <EditorSectionTitle title={t("recipes:editor.preparation")} />
            <Text className="text-sm font-semibold text-muted">
              {draft.steps.length}
            </Text>
          </View>
          {errors.steps ? (
            <ErrorText message={errorMessage(errors.steps)} />
          ) : null}
          {draft.steps.map((item, index) => {
            const itemError = errors.stepIds[item.id]?.description;
            return (
              <View key={item.id} className="mb-3 rounded-2xl bg-surface p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-base font-bold text-foreground">
                    {t("recipes:editor.step", { number: index + 1 })}
                  </Text>
                  <Pressable
                    onPress={() =>
                      dispatch({ type: "removeStep", id: item.id })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={t("recipes:accessibility.removeStep")}
                    className="h-11 w-11 items-center justify-center"
                  >
                    <Text className="text-xl text-error">×</Text>
                  </Pressable>
                </View>
                <TextInput
                  value={item.title ?? ""}
                  onChangeText={(value) =>
                    dispatch({
                      type: "updateStep",
                      id: item.id,
                      field: "title",
                      value,
                    })
                  }
                  placeholder={t("recipes:editor.stepTitle")}
                  placeholderTextColor={Colors.muted}
                  accessibilityLabel={t("recipes:editor.stepTitle")}
                  className="mb-2 min-h-[48px] rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                />
                <TextInput
                  value={item.description}
                  onChangeText={(value) =>
                    dispatch({
                      type: "updateStep",
                      id: item.id,
                      field: "description",
                      value,
                    })
                  }
                  placeholder={t("recipes:editor.stepDescription")}
                  placeholderTextColor={Colors.muted}
                  multiline
                  accessibilityLabel={t("recipes:editor.stepDescription")}
                  className={`min-h-[88px] rounded-xl border bg-background px-3 py-3 text-sm leading-5 text-foreground ${itemError ? "border-error" : "border-border"}`}
                  textAlignVertical="top"
                />
                {itemError ? (
                  <ErrorText message={errorMessage(itemError)} />
                ) : null}
              </View>
            );
          })}
          <Button
            title={`+ ${t("recipes:editor.addStep")}`}
            variant="secondary"
            onPress={() => dispatch({ type: "addStep" })}
            className="mb-8"
          />

          <Button
            title={t("recipes:common.save")}
            onPress={handleSave}
            disabled={isUploadingImage}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EditorSectionTitle({ title }: { title: string }) {
  return <Text className="text-[22px] font-bold text-foreground">{title}</Text>;
}

function FieldLabel({ label }: { label: string }) {
  return (
    <Text className="mb-2 mt-1 text-sm font-bold text-foreground">{label}</Text>
  );
}

function ErrorText({ message }: { message?: string }) {
  return message ? (
    <Text className="mb-2 mt-1 text-xs font-semibold text-error">
      {message}
    </Text>
  ) : null;
}
