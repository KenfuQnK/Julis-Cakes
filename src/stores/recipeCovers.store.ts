import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { RecipeCoverSettings } from "@/src/utils/recipeCover";

const STORAGE_KEY = "@julis_cakes_recipe_covers";
type RecipeCovers = Partial<Record<string, RecipeCoverSettings>>;

interface RecipeCoversStore {
  covers: RecipeCovers;
  ready: boolean;
  load: () => Promise<void>;
  save: (id: string, settings?: RecipeCoverSettings) => Promise<void>;
}

export const useRecipeCoversStore = create<RecipeCoversStore>((set, get) => {
  let loading: Promise<void> | undefined;
  let pendingWrite = Promise.resolve();

  return {
    covers: {},
    ready: false,
    load: () => {
      if (get().ready) return Promise.resolve();
      loading ??= AsyncStorage.getItem(STORAGE_KEY)
        .then((value) => {
          const covers = value ? (JSON.parse(value) as RecipeCovers) : {};
          set({ covers, ready: true });
        })
        .finally(() => {
          loading = undefined;
        });
      return loading;
    },
    save: (id, settings) => {
      const write = pendingWrite.then(async () => {
        await get().load();
        const covers = { ...get().covers };
        if (settings) covers[id] = settings;
        else if (Object.hasOwn(covers, id)) delete covers[id];
        else return;

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(covers));
        set({ covers });
      });
      pendingWrite = write.catch(() => undefined);
      return write;
    },
  };
});
