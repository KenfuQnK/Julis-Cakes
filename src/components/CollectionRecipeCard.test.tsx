import { fireEvent, render, screen } from "@testing-library/react-native";

import { CollectionRecipeCard } from "@/src/components/CollectionRecipeCard";
import { useRecipesStore } from "@/src/stores/recipes.store";
import type { Recipe } from "@/src/types/recipe";

jest.mock("@expo/vector-icons/Feather", () => () => null);
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
    useRecipesStore.setState({ toggleFavorite: originalToggleFavorite });
  });

  it("abre la receta y cambia el favorito desde botones independientes", () => {
    const onOpen = jest.fn();
    const toggleFavorite = jest.fn().mockResolvedValue(undefined);
    useRecipesStore.setState({ toggleFavorite });

    render(
      <CollectionRecipeCard
        recipe={recipe}
        featured
        onOpen={onOpen}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
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
    fireEvent.press(
      screen.getByRole("button", { name: "recipes:accessibility.openRecipe" }),
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("muestra las opciones de edición y borrado solo para recetas propias", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { rerender } = render(
      <CollectionRecipeCard
        recipe={recipe}
        featured={false}
        onOpen={jest.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("recipes:categories.quick")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "recipes:mine.deleteLabel" }),
    ).toBeNull();
    fireEvent.press(
      screen.getByRole("button", { name: "recipes:mine.actions" }),
    );
    fireEvent.press(
      screen.getByRole("button", { name: "recipes:mine.editLabel" }),
    );
    fireEvent.press(
      screen.getByRole("button", { name: "recipes:mine.deleteLabel" }),
    );
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);

    rerender(
      <CollectionRecipeCard
        recipe={{ ...recipe, isUserCreated: false }}
        featured={false}
        onOpen={jest.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "recipes:mine.actions" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "recipes:mine.deleteLabel" }),
    ).toBeNull();
  });
});
