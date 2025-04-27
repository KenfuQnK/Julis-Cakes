// [id].js (pantalla de detalle de receta adaptada a Tailwind)
import { useLocalSearchParams } from 'expo-router';
import { View, useWindowDimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import RecipesList from '../../components/screens/RecipesList';
import RecipeDetail from '../../components/screens/RecipeDetail';
import ChatSection from '../../components/screens/ChatSection';
import { recipes } from '../../data/recipes';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const [showRecipesList, setShowRecipesList] = useState(width >= 768);
  const [showChatSection, setShowChatSection] = useState(width >= 1024);

  const currentRecipe = recipes.find(recipe => recipe.id === id) || recipes[0];

  useEffect(() => {
    setShowRecipesList(width >= 768);
    setShowChatSection(width >= 1024);
  }, [width]);

  if (!currentRecipe) return null;

  if (width < 768) {
    return (
      <View className="flex-1">
        <View className="flex-1 bg-primary">
          <RecipeDetail recipe={currentRecipe} />
        </View>
      </View>
    );
  }

  if (width < 1024) {
    return (
      <View className="flex-1 flex-row">
        <View className="w-1/3 min-w-[200px] max-w-[300px] border-r border-border">
          <RecipesList recipes={recipes} currentRecipeId={currentRecipe.id} />
        </View>
        <View className="flex-1 bg-primary">
          <RecipeDetail recipe={currentRecipe} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row">
      <View className="w-1/4 min-w-[200px] max-w-[300px] border-r border-border">
        <RecipesList recipes={recipes} currentRecipeId={currentRecipe.id} />
      </View>
      <View className="flex-1 bg-primary">
        <RecipeDetail recipe={currentRecipe} />
      </View>
      <View className="w-1/4 min-w-[200px] max-w-[300px] border-l border-border">
        <ChatSection />
      </View>
    </View>
  );
}
