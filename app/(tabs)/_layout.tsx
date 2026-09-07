import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { TabBarIcon } from "@/src/components/TabBarIcon";
import { Colors } from "@/src/constants/Colors";

export default function TabLayout() {
  const { t } = useTranslation(["recipes"]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.icon,
        headerShown: false,
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("recipes:nav.home"),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("recipes:nav.search"),
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t("recipes:nav.create"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="plus-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: t("recipes:nav.mine"),
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t("recipes:nav.ai"),
          tabBarIcon: ({ color }) => <TabBarIcon name="magic" color={color} />,
        }}
      />
    </Tabs>
  );
}
