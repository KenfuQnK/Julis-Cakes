import { Link, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/Colors";

export default function NotFoundScreen() {
  const { t } = useTranslation(["recipes"]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: t("recipes:detail.notFoundTitle") }} />

      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-sm items-center rounded-[40px] border border-border bg-surface p-8">
          <FontAwesome name="search" size={44} color={Colors.primary} />

          <Text className="mb-2 text-center text-2xl font-extrabold text-foreground">
            {t("recipes:detail.notFoundTitle")}
          </Text>

          <Text className="mb-8 text-center text-lg text-muted">
            {t("recipes:detail.notFoundBody")}
          </Text>

          <Link href="/" className="w-full">
            <View className="items-center rounded-[28px] bg-primary p-4 shadow-md">
              <Text className="text-lg font-semibold text-white">
                {t("recipes:detail.goHome")}
              </Text>
            </View>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
