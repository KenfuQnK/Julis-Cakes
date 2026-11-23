import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { RecipeCardSize, RecipeCardSizes } from "@/src/utils/recipeGrid";

interface RecipeCardSizesStore {
  sizes: RecipeCardSizes;
  setSize: (id: string, size: RecipeCardSize) => void;
  removeSize: (id: string) => void;
}

export const useRecipeCardSizesStore = create<RecipeCardSizesStore>()(
  persist(
    (set, get) => ({
      sizes: {},
      setSize: (id, size) => {
        if (size === "square") {
          get().removeSize(id);
        } else {
          set((state) => ({ sizes: { ...state.sizes, [id]: size } }));
        }
      },
      removeSize: (id) => {
        if (!Object.hasOwn(get().sizes, id)) return;
        const sizes = { ...get().sizes };
        delete sizes[id];
        set({ sizes });
      },
    }),
    {
      name: "@julis_cakes_recipe_card_sizes",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ sizes }) => ({ sizes }),
    },
  ),
);
