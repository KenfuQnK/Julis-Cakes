import MaskedView from "@react-native-masked-view/masked-view";
import { View } from "react-native";

import type { RecipeCoverMaskProps } from "./RecipeCoverMask.types";

export function RecipeCoverMask({
  gradient,
  layout,
  interactive,
  children,
}: RecipeCoverMaskProps) {
  return (
    <MaskedView
      style={{ position: "absolute", inset: 0 }}
      androidRenderingMode={interactive ? "software" : "hardware"}
      maskElement={
        <View
          style={{
            position: "absolute",
            left: layout.left,
            top: layout.top,
            width: layout.width,
            height: layout.height,
            experimental_backgroundImage: gradient,
          }}
        />
      }
    >
      {children}
    </MaskedView>
  );
}
