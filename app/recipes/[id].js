import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import RecipesList from '../../components/screens/RecipesList';
import RecipeDetail from '../../components/screens/RecipeDetail';
import ChatSection from '../../components/screens/ChatSection';
import { recipes } from '../../data/recipes';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

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
      <View style={styles.container}>
        <View style={styles.recipeDetailContainer}>
          <RecipeDetail recipe={currentRecipe} />
        </View>
      </View>
    );
  }

  if (width < 1024) {
    return (
      <View style={styles.container}>
        <View style={styles.sidebarContainer}>
          <RecipesList recipes={recipes} currentRecipeId={currentRecipe.id} />
        </View>
        <View style={styles.recipeDetailContainer}>
          <RecipeDetail recipe={currentRecipe} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebarContainer}>
        <RecipesList recipes={recipes} currentRecipeId={currentRecipe.id} />
      </View>
      <View style={styles.recipeDetailContainer}>
        <RecipeDetail recipe={currentRecipe} />
      </View>
      <View style={styles.chatContainer}>
        <ChatSection />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebarContainer: { width: '25%', maxWidth: 300, minWidth: 200, ...Platform.select({ web: { borderRightWidth: 1, borderRightColor: Colors.border }, default: { elevation: 2 } }) },
  recipeDetailContainer: { flex: 1, backgroundColor: Colors.primary },
  chatContainer: { width: '25%', maxWidth: 300, minWidth: 200, ...Platform.select({ web: { borderLeftWidth: 1, borderLeftColor: Colors.border }, default: { elevation: 2 } }) },
});
