import { Pressable, Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-end justify-between">
      <Text className="text-[22px] font-bold text-foreground">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="min-h-[44px] justify-center px-1"
        >
          <Text className="text-sm font-bold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
