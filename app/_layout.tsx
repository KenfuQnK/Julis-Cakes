import "../global.css";
import "@/src/utils/i18n";

import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LanguageProvider } from "@/src/context/LanguageContext";
import { Colors } from "@/src/constants/Colors";
import { useRecipesStore } from "@/src/stores/recipes.store";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const initializeRecipes = useRecipesStore((state) => state.initialize);

  useEffect(() => {
    void initializeRecipes();
  }, [initializeRecipes]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="recipe/[id]"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
              }}
            />
            <Stack.Screen
              name="recipe/edit/[id]"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
              }}
            />
          </Stack>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
