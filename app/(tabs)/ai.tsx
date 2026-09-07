import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/Colors";

export default function AiScreen() {
  const { t } = useTranslation(["recipes"]);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 18 }}
      className="flex-1 bg-background px-5"
    >
      <Text className="text-[30px] font-extrabold text-foreground">
        {t("recipes:ai.title")}
      </Text>
      <View className="mt-12 items-center rounded-[28px] bg-surface-alt px-7 py-12">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
          <FontAwesome name="magic" size={40} color={Colors.primary} />
        </View>
        <Text className="mb-3 text-center text-2xl font-bold text-foreground">
          {t("recipes:ai.comingSoon")}
        </Text>
        <Text className="mb-3 text-center text-base leading-6 text-muted">
          {t("recipes:ai.body")}
        </Text>
        <Text className="text-center text-sm leading-5 text-muted">
          {t("recipes:ai.feature")}
        </Text>
      </View>
    </View>
  );
}
