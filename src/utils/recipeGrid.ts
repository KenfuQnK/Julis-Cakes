import type { Recipe } from "@/src/types/recipe";
import { packGrid } from "@/src/utils/packGrid";

export const RECIPE_CARD_SIZES = {
  square: { colSpan: 1, rowSpan: 1 },
  vertical: { colSpan: 1, rowSpan: 2 },
  horizontal: { colSpan: 2, rowSpan: 1 },
} as const;

export type RecipeCardSize = keyof typeof RECIPE_CARD_SIZES;
export type RecipeCardSizes = Partial<Record<string, RecipeCardSize>>;

interface GridCard {
  recipe: Recipe;
  size: RecipeCardSize;
  featured: boolean;
  row: number;
  col: number;
}

interface GridBand {
  row: number;
  rows: number;
  cards: GridCard[];
}

export function getRecipeGridBands(
  recipes: Recipe[],
  sizes: RecipeCardSizes,
  showFeatured: boolean,
): GridBand[] {
  const cardSizes = recipes.map(({ id }) => sizes[id] ?? "square");
  const { positions } = packGrid(
    recipes.length,
    2,
    (index) => RECIPE_CARD_SIZES[cardSizes[index]],
  );
  const cards = positions
    .map((position, index) => ({
      ...position,
      recipe: recipes[index],
      size: cardSizes[index],
      featured: showFeatured && index === 0,
    }))
    .sort((a, b) => a.row - b.row || a.col - b.col);

  // A FlatList item can end wherever no card crosses into the next row.
  const bands: GridBand[] = [];
  for (const card of cards) {
    const end = card.row + RECIPE_CARD_SIZES[card.size].rowSpan;
    const band = bands.at(-1);
    if (band && card.row < band.row + band.rows) {
      band.cards.push(card);
      band.rows = Math.max(band.rows, end - band.row);
    } else {
      bands.push({ row: card.row, rows: end - card.row, cards: [card] });
    }
  }
  return bands;
}
