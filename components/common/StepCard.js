// StepCard.js (actualizado a Tailwind)
import React from 'react';
import { View, Image, Text } from 'react-native';
import Card from './Card';

export default function StepCard({ step, index }) {
  return (
    <Card style="h-[140px] w-[140px] m-1 relative">
      <View className="absolute top-1 left-1 bg-white/70 p-1 rounded-sm z-10">
        <Text className="text-xs font-bold text-text">Paso {index + 1}</Text>
      </View>

      <View className="absolute top-0 left-0 right-0 p-2 z-0 h-3/4">
        <Image 
          source={step.image}
          className="w-full h-full rounded-sm"
          resizeMode="cover"
        />
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-2 flex-grow justify-end z-20">
        <Text className="text-center font-bold text-xs text-text">
          {step.description}
        </Text>
      </View>
    </Card>
  );
}