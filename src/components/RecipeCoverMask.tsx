import { View } from "react-native";

import type { RecipeCoverMaskProps } from "./RecipeCoverMask.types";

export function RecipeCoverMask({
  gradient,
  layout,
  children,
}: RecipeCoverMaskProps) {
  const mask = {
    maskImage: gradient,
    maskPosition: `${layout.left}px ${layout.top}px`,
    maskSize: `${layout.width}px ${layout.height}px`,
    maskRepeat: "no-repeat",
    overflow: "hidden",
  } as const;
  return (
    <View className="absolute inset-0" style={mask}>
      {children}
    </View>
  );
}
