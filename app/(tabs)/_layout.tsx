import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/Colors";

export default function TabLayout() {
  const { t } = useTranslation(["recipes"]);
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.muted,
        tabBarActiveBackgroundColor: Colors.primarySoft,
        tabBarLabelPosition: "below-icon",
        tabBarHideOnKeyboard: true,
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
        tabBarItemStyle: {
          borderRadius: 20,
          overflow: "hidden",
        },
        tabBarStyle: {
          width: "100%",
          maxWidth: 590,
          alignSelf: "center",
          height: 66 + bottom,
          paddingTop: 6,
          paddingBottom: 5 + bottom,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("recipes:nav.home"),
          tabBarAccessibilityLabel: t("recipes:nav.home"),
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("recipes:nav.search"),
          tabBarAccessibilityLabel: t("recipes:nav.search"),
          tabBarIcon: ({ color }) => (
            <Feather name="search" size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t("recipes:nav.create"),
          tabBarAccessibilityLabel: t("recipes:nav.create"),
          tabBarItemStyle: { overflow: "visible" },
          tabBarActiveBackgroundColor: "transparent",
          tabBarIcon: () => (
            <View className="-mt-3 h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Feather name="plus" size={26} color={Colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: t("recipes:nav.mine"),
          tabBarAccessibilityLabel: t("recipes:nav.mine"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="notebook-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t("recipes:nav.ai"),
          tabBarAccessibilityLabel: t("recipes:nav.ai"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="sparkles-outline" size={23} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
