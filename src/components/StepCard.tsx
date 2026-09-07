import { Text, View } from "react-native";

interface StepCardProps {
  number: number;
  title?: string;
  description: string;
}

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <View className="mb-3 flex-row rounded-[18px] bg-surface p-4">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-primary">
        <Text className="text-base font-bold text-white">{number}</Text>
      </View>
      <View className="flex-1">
        {title ? (
          <Text className="mb-1 text-base font-bold text-foreground">
            {title}
          </Text>
        ) : null}
        <Text className="text-[15px] leading-6 text-muted">{description}</Text>
      </View>
    </View>
  );
}
