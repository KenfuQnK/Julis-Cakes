import type { RecipeDraft } from "@/src/types/recipe";

export type RecipeValidationKey =
  | "nameRequired"
  | "ingredientsRequired"
  | "stepsRequired"
  | "positiveTime"
  | "positiveServings"
  | "ingredientNameRequired"
  | "ingredientAmountRequired"
  | "stepDescriptionRequired";

export interface RecipeValidationErrors {
  title?: RecipeValidationKey;
  ingredients?: RecipeValidationKey;
  steps?: RecipeValidationKey;
  totalTimeMinutes?: RecipeValidationKey;
  servings?: RecipeValidationKey;
  ingredientIds: Record<
    string,
    { name?: RecipeValidationKey; amount?: RecipeValidationKey }
  >;
  stepIds: Record<string, { description?: RecipeValidationKey }>;
}

export function validateRecipeDraft(
  draft: RecipeDraft,
): RecipeValidationErrors {
  const errors: RecipeValidationErrors = { ingredientIds: {}, stepIds: {} };
  if (!draft.title.trim()) errors.title = "nameRequired";
  if (!draft.ingredients.length) errors.ingredients = "ingredientsRequired";
  if (!draft.steps.length) errors.steps = "stepsRequired";

  if (draft.totalTimeMinutes && Number(draft.totalTimeMinutes) <= 0) {
    errors.totalTimeMinutes = "positiveTime";
  }
  if (draft.servings && Number(draft.servings) <= 0)
    errors.servings = "positiveServings";

  draft.ingredients.forEach((item) => {
    const itemErrors: {
      name?: RecipeValidationKey;
      amount?: RecipeValidationKey;
    } = {};
    if (!item.name.trim()) itemErrors.name = "ingredientNameRequired";
    if (!item.amount.trim()) itemErrors.amount = "ingredientAmountRequired";
    if (itemErrors.name || itemErrors.amount)
      errors.ingredientIds[item.id] = itemErrors;
  });

  draft.steps.forEach((item) => {
    if (!item.description.trim())
      errors.stepIds[item.id] = { description: "stepDescriptionRequired" };
  });

  return errors;
}

export function hasRecipeValidationErrors(
  errors: RecipeValidationErrors,
): boolean {
  return Boolean(
    errors.title ||
    errors.ingredients ||
    errors.steps ||
    errors.totalTimeMinutes ||
    errors.servings ||
    Object.keys(errors.ingredientIds).length ||
    Object.keys(errors.stepIds).length,
  );
}
