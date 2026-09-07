import { Pressable, Text } from "react-native";

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryChip({
  label,
  selected = false,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`min-h-[40px] justify-center rounded-full px-4 ${selected ? "bg-primary" : "bg-surface"}`}
    >
      <Text
        className={`text-sm font-semibold ${selected ? "text-white" : "text-foreground"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
