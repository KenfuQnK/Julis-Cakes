import type { Recipe } from "@/src/types/recipe";
import { getRecipeGridBands, RECIPE_CARD_SIZES } from "@/src/utils/recipeGrid";

const recipes = ["a", "b", "c", "d", "e"].map((id): Recipe => ({
  id,
  title: id,
  description: "",
  ingredients: [],
  steps: [],
  isUserCreated: true,
  isFavorite: id === "b" || id === "d",
  createdAt: "",
  updatedAt: "",
}));

describe("getRecipeGridBands", () => {
  it("rellena los huecos anteriores con recetas posteriores, sin solaparlas", () => {
    const bands = getRecipeGridBands(
      recipes,
      { a: "vertical", b: "horizontal", d: "vertical" },
      true,
    );
    const positions = bands.flatMap(({ cards }) =>
      cards.map(({ recipe, size, row, col }) => [recipe.id, size, row, col]),
    );
    expect(positions).toEqual([
      ["a", "vertical", 0, 0],
      ["c", "square", 0, 1],
      ["e", "square", 1, 1],
      ["b", "horizontal", 2, 0],
      ["d", "vertical", 3, 0],
    ]);
    const occupied = new Set<string>();
    for (const { cards } of bands) {
      for (const { row, col, size } of cards) {
        const { rowSpan, colSpan } = RECIPE_CARD_SIZES[size];
        for (let r = row; r < row + rowSpan; r++) {
          for (let c = col; c < col + colSpan; c++) {
            expect(c).toBeLessThan(2);
            expect(occupied.has(`${r}:${c}`)).toBe(false);
            occupied.add(`${r}:${c}`);
          }
        }
      }
    }
    expect(bands.map(({ rows }) => rows)).toEqual([2, 1, 2]);
  });

  it("recoloca las tarjetas al filtrar, cambiar el tamaño y eliminar", () => {
    const favorites = recipes.filter(({ isFavorite }) => isFavorite);
    const sizes = { b: "horizontal", d: "vertical" } as const;
    const filtered = getRecipeGridBands(favorites, sizes, false);
    expect(filtered.map(({ rows }) => rows)).toEqual([1, 2]);
    expect(
      filtered.flatMap(({ cards }) => cards).some(({ featured }) => featured),
    ).toBe(false);
    const resized = getRecipeGridBands(
      favorites,
      { ...sizes, b: "square" },
      false,
    );
    expect(resized).toHaveLength(1);
    expect(resized[0].cards.map(({ col }) => col)).toEqual([0, 1]);
    const afterDelete = getRecipeGridBands(
      favorites.filter(({ id }) => id !== "b"),
      sizes,
      false,
    );
    expect(afterDelete[0].cards[0]).toMatchObject({
      row: 0,
      col: 0,
      size: "vertical",
    });
    expect(getRecipeGridBands([], sizes, false)).toEqual([]);
  });
});
