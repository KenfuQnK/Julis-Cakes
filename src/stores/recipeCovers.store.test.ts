import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRecipeCoversStore } from "@/src/stores/recipeCovers.store";
import { DEFAULT_RECIPE_COVER } from "@/src/utils/recipeCover";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);

const adjusted = {
  ...DEFAULT_RECIPE_COVER,
  titleSide: "right" as const,
  x: 0.2,
  zoom: 1.35,
  shade: 0.81,
  blur: false,
};

describe("ajustes de portada por receta", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useRecipeCoversStore.setState({ covers: {}, ready: false });
  });

  it("recupera los ajustes guardados y el restablecimiento tras cargar desde el almacenamiento", async () => {
    const { save, load } = useRecipeCoversStore.getState();
    await Promise.all([
      save("one", adjusted),
      save("two", DEFAULT_RECIPE_COVER),
    ]);

    useRecipeCoversStore.setState({ covers: {}, ready: false });
    await load();
    expect(useRecipeCoversStore.getState().covers).toEqual({
      one: adjusted,
      two: DEFAULT_RECIPE_COVER,
    });

    await save("one");
    useRecipeCoversStore.setState({ covers: {}, ready: false });
    await load();
    expect(useRecipeCoversStore.getState().covers).toEqual({
      two: DEFAULT_RECIPE_COVER,
    });
  });

  it("conserva el último ajuste guardado si falla la escritura y permite reintentar", async () => {
    const { save } = useRecipeCoversStore.getState();
    await save("one", adjusted);
    jest
      .mocked(AsyncStorage.setItem)
      .mockRejectedValueOnce(new Error("Sin espacio"));

    await expect(save("one", DEFAULT_RECIPE_COVER)).rejects.toThrow(
      "Sin espacio",
    );
    expect(useRecipeCoversStore.getState().covers.one).toEqual(adjusted);
    await expect(save("one")).resolves.toBeUndefined();
    expect(useRecipeCoversStore.getState().covers.one).toBeUndefined();
  });
});
