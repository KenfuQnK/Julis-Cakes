import type { PropsWithChildren } from "react";

import type { CoverSize } from "@/src/utils/recipeCover";

export type RecipeCoverMaskProps = PropsWithChildren<{
  gradient: string;
  layout: CoverSize & { left: number; top: number };
  interactive: boolean;
}>;
