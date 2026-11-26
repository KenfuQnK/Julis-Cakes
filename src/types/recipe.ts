export type RecipeCategory = "desserts" | "healthy" | "quick" | "airFryer";

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  imageUri?: string;
}

export interface RecipeStep {
  id: string;
  title?: string;
  description: string;
  imageUri?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  imageUris?: string[];
  totalTimeMinutes?: number;
  servings?: number;
  category?: RecipeCategory;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  isFavorite: boolean;
  isUserCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDraft {
  title: string;
  description: string;
  imageUri?: string;
  imageUris: string[];
  totalTimeMinutes: string;
  servings: string;
  category: RecipeCategory;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}
