import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import type { ReactNode } from "react";
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
  trailingAction?: ReactNode;
  rounded?: boolean;
}

export function SearchInput({
  value,
  placeholder,
  onChangeText,
  onClear,
  onPress,
  autoFocus = false,
  clearLabel,
  trailingAction,
  rounded = false,
}: SearchInputProps) {
  return (
    <View
      className={`flex-row items-center bg-surface pl-4 ${rounded ? "min-h-[44px] rounded-full pr-2 shadow-recipe" : "min-h-[52px] rounded-2xl border border-border pr-4"}`}
    >
      {rounded ? (
        <Feather name="search" size={22} color={Colors.muted} />
      ) : (
        <FontAwesome name="search" size={18} color={Colors.muted} />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onPressIn={onPress}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder}
        accessibilityRole="search"
        className={`ml-3 min-w-0 flex-1 text-base text-foreground ${rounded ? "min-h-[44px]" : "min-h-[50px]"}`}
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
      {trailingAction}
    </View>
  );
}
