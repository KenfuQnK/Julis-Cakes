import type { ImageSourcePropType } from "react-native";

export type RecipeCategory = "desserts" | "healthy" | "quick" | "airFryer";

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  imageUri?: string;
  localImage?: ImageSourcePropType;
}

export interface RecipeStep {
  id: string;
  title?: string;
  description: string;
  imageUri?: string;
  localImage?: ImageSourcePropType;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  localImage?: ImageSourcePropType;
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
  totalTimeMinutes: string;
  servings: string;
  category: RecipeCategory;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}
