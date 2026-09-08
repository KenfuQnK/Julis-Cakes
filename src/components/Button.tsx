import { forwardRef } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

type ButtonProps = {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = "primary", className, ...touchableProps }, ref) => {
    const disabledClassName = touchableProps.disabled ? "opacity-50" : "";
    const variantClassName = {
      primary: "bg-primary",
      secondary: "border border-border bg-surface",
      ghost: "bg-transparent",
    }[variant];

    const textClassName =
      variant === "primary" ? "text-white" : "text-foreground";

    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        accessibilityRole="button"
        className={`min-h-[52px] items-center justify-center rounded-2xl px-5 ${variantClassName} ${disabledClassName} ${className ?? ""}`}
      >
        <Text className={`text-center text-base font-bold ${textClassName}`}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  },
);

Button.displayName = "Button";
