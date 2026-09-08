import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { ColorValue } from "react-native";

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: ColorValue;
}) => {
  return <FontAwesome size={23} {...props} />;
};
