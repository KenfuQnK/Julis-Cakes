import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";

import { CollectionRecipeCard } from "@/src/components/CollectionRecipeCard";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe } from "@/src/types/recipe";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);
jest.mock("@expo/vector-icons/FontAwesome", () => () => null);
jest.mock("@expo/vector-icons/Ionicons", () => () => null);
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => () => null);
jest.mock("@/src/services/recipes.service", () => ({}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const recipe: Recipe = {
  id: "recipe-1",
  title: "Burrito con berenjena",
  description: "",
  category: "quick",
  ingredients: [],
  steps: [],
  isFavorite: false,
  isUserCreated: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("CollectionRecipeCard", () => {
  const originalToggleFavorite = useRecipesStore.getState().toggleFavorite;

  afterEach(() => {
    cleanup();
    useRecipesStore.setState({ toggleFavorite: originalToggleFavorite });
  });

  it("abre la receta y cambia el favorito desde botones independientes", () => {
    const onOpen = jest.fn();
    const onResize = jest.fn();
    const toggleFavorite = jest.fn().mockResolvedValue(undefined);
    useRecipesStore.setState({ toggleFavorite });

    render(
      <CollectionRecipeCard
        recipe={recipe}
        size="square"
        featured
        onOpen={onOpen}
        onResize={onResize}
      />,
    );

    expect(screen.getByText("recipes:mine.featured")).toBeTruthy();
    fireEvent.press(
      screen.getByRole("button", {
        name: "recipes:accessibility.toggleFavoriteOff",
      }),
    );
    expect(toggleFavorite).toHaveBeenCalledWith(recipe.id);
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText(recipe.title));
    expect(onOpen).toHaveBeenCalledTimes(1);
    fireEvent(
      screen.getByRole("button", { name: "recipes:accessibility.openRecipe" }),
      "longPress",
    );
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("permite cambiar el tamaño desde la acción de accesibilidad de la tarjeta", () => {
    const onResize = jest.fn();
    render(
      <CollectionRecipeCard
        recipe={{ ...recipe, isUserCreated: false }}
        size="horizontal"
        featured={false}
        onOpen={jest.fn()}
        onResize={onResize}
      />,
    );

    expect(screen.getByText("recipes:categories.quick")).toBeTruthy();
    const card = screen.getByRole("button", {
      name: "recipes:accessibility.openRecipe",
    });
    fireEvent(card, "accessibilityAction", {
      nativeEvent: { actionName: "resize" },
    });
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
