import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, TextInput, View } from "react-native";

import { Colors } from "@/src/constants/Colors";

interface SearchInputProps {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onClear?: () => void;
  onPress?: () => void;
  autoFocus?: boolean;
  clearLabel: string;
}

export function SearchInput({
  value,
  placeholder,
  onChangeText,
  onClear,
  onPress,
  autoFocus = false,
  clearLabel,
}: SearchInputProps) {
  return (
    <View className="min-h-[52px] flex-row items-center rounded-2xl border border-border bg-surface px-4">
      <FontAwesome name="search" size={18} color={Colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onPressIn={onPress}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        autoFocus={autoFocus}
        accessibilityRole="search"
        className="ml-3 min-h-[50px] flex-1 text-base text-foreground"
      />
      {value.length > 0 && onClear ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          className="h-11 w-11 items-center justify-center"
        >
          <FontAwesome name="times-circle" size={18} color={Colors.icon} />
        </Pressable>
      ) : null}
    </View>
  );
}
