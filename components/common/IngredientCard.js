// IngredientCard.js (actualizado a Tailwind)
import React from 'react';
import { View, Image, Text } from 'react-native';
import Card from './Card';

export default function IngredientCard({ ingredient }) {
  return (
    <Card className="h-[120px] w-[120px] m-1 relative">
      <View className="absolute top-0 left-0 right-0 p-2 z-10 h-3/4">
        <Image 
          source={ingredient.image}
          className="w-full h-full rounded-sm"
          resizeMode="cover"
        />
      </View>
      <View className="absolute bottom-0 left-0 right-0 p-2 flex-grow justify-end z-20">
        <Text className="text-center font-bold text-xs text-text" numberOfLines={3}>
          {ingredient.name}
        </Text>
      </View>
    </Card>
  );
}