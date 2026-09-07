import { seedRecipes } from "@/server/seed-recipes";

import { searchRecipes } from "./recipeSearch";

describe("searchRecipes", () => {
  it("encuentra por título y descripción", () => {
    expect(
      searchRecipes(seedRecipes, "chocolate").map((recipe) => recipe.id),
    ).toEqual(
      expect.arrayContaining([
        "pastel-de-chocolate",
        "pastel-fitness-platano-chocolate",
      ]),
    );
  });

  it("encuentra por ingrediente", () => {
    expect(searchRecipes(seedRecipes, "zanahoria", "ingredients")).toHaveLength(
      1,
    );
  });

  it("devuelve todas cuando la búsqueda está vacía", () => {
    expect(searchRecipes(seedRecipes, "")).toHaveLength(seedRecipes.length);
  });
});
