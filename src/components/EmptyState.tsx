import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";

import { Colors } from "@/src/constants/Colors";

interface EmptyStateProps {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View className="items-center rounded-[22px] bg-surface-alt px-6 py-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
        <FontAwesome name="heart-o" size={28} color={Colors.primary} />
      </View>
      <Text className="mb-2 text-center text-xl font-bold text-foreground">
        {title}
      </Text>
      <Text className="text-center text-[15px] leading-6 text-muted">
        {body}
      </Text>
    </View>
  );
}
