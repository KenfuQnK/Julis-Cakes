import { fireEvent, render, screen } from "@testing-library/react-native";

import { RecipeCover } from "@/src/components/RecipeCover";
import type { Recipe } from "@/src/types/recipe";
import { DEFAULT_RECIPE_COVER } from "@/src/utils/recipeCover";

jest.mock("@expo/vector-icons/Feather", () => () => null);
jest.mock("@expo/vector-icons/FontAwesome", () => () => null);
jest.mock("@expo/vector-icons/Ionicons", () => () => null);
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => () => null);
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const recipe: Recipe = {
  id: "recipe-1",
  title: "Burrito con berenjena",
  description: "",
  ingredients: [],
  steps: [],
  imageUri: "https://example.com/burrito.jpg",
  isFavorite: true,
  isUserCreated: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("portada de receta", () => {
  it("abre la receta, cambia el favorito y muestra el menú con acciones separadas", () => {
    const onOpen = jest.fn();
    const onFavorite = jest.fn();
    const onMenu = jest.fn();

    render(
      <RecipeCover
        recipe={recipe}
        frame={{ width: 390, height: 120 }}
        settings={DEFAULT_RECIPE_COVER}
        featured
        onOpen={onOpen}
        onFavorite={onFavorite}
        onMenu={onMenu}
      />,
    );

    const cover = screen.getByRole("button", {
      name: "recipes:accessibility.openRecipe",
    });
    const favorite = screen.getByRole("button", {
      name: "recipes:accessibility.toggleFavoriteOn",
    });
    fireEvent.press(favorite);
    fireEvent.press(screen.getByRole("button", { name: "recipes:cover.menu" }));
    fireEvent(cover, "longPress");
    expect(onFavorite).toHaveBeenCalledTimes(1);
    expect(onMenu).toHaveBeenCalledTimes(2);
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.press(cover);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
