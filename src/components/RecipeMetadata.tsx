import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "@/src/constants/Colors";

interface RecipeMetadataProps {
  totalTimeMinutes?: number;
  servings?: number;
  light?: boolean;
}

export function RecipeMetadata({
  totalTimeMinutes,
  servings,
  light = false,
}: RecipeMetadataProps) {
  const { t } = useTranslation(["recipes"]);
  const textClassName = light ? "text-white" : "text-foreground";
  const mutedClassName = light ? "text-white/75" : "text-muted";

  return (
    <View className="flex-row items-center gap-4">
      {totalTimeMinutes ? (
        <View className="flex-row items-center gap-2">
          <FontAwesome
            name="clock-o"
            size={15}
            color={light ? Colors.white : Colors.foreground}
          />
          <Text className={`text-sm font-semibold ${textClassName}`}>
            {totalTimeMinutes} {t("recipes:common.minutes")}
          </Text>
        </View>
      ) : null}
      {servings ? (
        <View className="flex-row items-center gap-2">
          <FontAwesome
            name="users"
            size={14}
            color={light ? Colors.white : Colors.muted}
          />
          <Text className={`text-sm ${mutedClassName}`}>
            {servings} {t("recipes:common.servings")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
