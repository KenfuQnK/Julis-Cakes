import type { RecipeDraft } from "@/src/types/recipe";

import {
  hasRecipeValidationErrors,
  validateRecipeDraft,
} from "./recipeValidation";

const validDraft: RecipeDraft = {
  title: "Receta de prueba",
  description: "",
  totalTimeMinutes: "20",
  servings: "4",
  category: "desserts",
  ingredients: [{ id: "i1", name: "Harina", amount: "100 g" }],
  steps: [{ id: "s1", description: "Mezclar" }],
};

describe("validateRecipeDraft", () => {
  it("acepta un borrador completo", () => {
    expect(hasRecipeValidationErrors(validateRecipeDraft(validDraft))).toBe(
      false,
    );
  });

  it("valida los mínimos y los números positivos", () => {
    const errors = validateRecipeDraft({
      ...validDraft,
      title: "",
      totalTimeMinutes: "-1",
      ingredients: [],
      steps: [],
    });
    expect(errors.title).toBe("nameRequired");
    expect(errors.ingredients).toBe("ingredientsRequired");
    expect(errors.steps).toBe("stepsRequired");
    expect(errors.totalTimeMinutes).toBe("positiveTime");
  });
});
