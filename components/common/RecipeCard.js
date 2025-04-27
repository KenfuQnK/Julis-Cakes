// RecipeCard.js (actualizado a Tailwind)
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function RecipeCard({ recipe, isActive = false }) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/recipes/${recipe.id}`);
  };

  return (
    <TouchableOpacity
      className={`flex-row bg-white rounded-md mb-4 h-[70px] shadow-md overflow-hidden ${isActive ? 'bg-activeCardBg border-l-4 border-accent' : ''}`}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View className="flex-1 p-4 justify-center">
        <Text className="text-base text-text">{recipe.title}</Text>
      </View>
      <View className="w-20 h-full bg-secondary justify-center items-center">
        <Text className="text-white font-bold">imagen</Text>
      </View>
    </TouchableOpacity>
  );
}