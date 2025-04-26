import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import RecipesList from '../components/screens/RecipesList';
import RecipeDetail from '../components/screens/RecipeDetail';
import ChatSection from '../components/screens/ChatSection';
import { recipes } from '../data/recipes';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

export default function RecipeScreen({ route, navigation }) {
  const { id } = route.params;
  const { width } = useWindowDimensions();
  
  // Estado para controlar si mostramos las tres columnas o solo el detalle de la receta
  const [showRecipesList, setShowRecipesList] = useState(width >= 768);
  const [showChatSection, setShowChatSection] = useState(width >= 1024);
  
  // Encontrar la receta actual
  const currentRecipe = recipes.find(recipe => recipe.id === id) || recipes[0];
  
  // Actualizar la vista basado en el ancho de la pantalla
  useEffect(() => {
    setShowRecipesList(width >= 768);
    setShowChatSection(width >= 1024);
  }, [width]);

  // Estructura de diseño adaptativa
  const renderLayout = () => {
    // En dispositivos móviles, solo mostrar el detalle de la receta
    if (width < 768) {
      return (
        <View style={styles.container}>
          <View style={styles.recipeDetailContainer}>
            <RecipeDetail recipe={currentRecipe} />
          </View>
        </View>
      );
    }
    
    // En tablets, mostrar lista de recetas y detalle
    if (width < 1024) {
      return (
        <View style={styles.container}>
          <View style={styles.sidebarContainer}>
            <RecipesList 
              recipes={recipes} 
              currentRecipeId={currentRecipe.id} 
            />
          </View>
          <View style={styles.recipeDetailContainer}>
            <RecipeDetail recipe={currentRecipe} />
          </View>
        </View>
      );
    }
    
    // En dispositivos grandes, mostrar las tres columnas
    return (
      <View style={styles.container}>
        <View style={styles.sidebarContainer}>
          <RecipesList 
            recipes={recipes} 
            currentRecipeId={currentRecipe.id} 
          />
        </View>
        <View style={styles.recipeDetailContainer}>
          <RecipeDetail recipe={currentRecipe} />
        </View>
        <View style={styles.chatContainer}>
          <ChatSection />
        </View>
      </View>
    );
  };

  return renderLayout();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: '25%',
    maxWidth: 300,
    minWidth: 200,
    ...Platform.select({
      web: {
        borderRightWidth: 1,
        borderRightColor: Colors.border,
      },
      default: {
        // En móvil, usamos sombras para las separaciones
        elevation: 2,
      },
    }),
  },
  recipeDetailContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  chatContainer: {
    width: '25%',
    maxWidth: 300,
    minWidth: 200,
    ...Platform.select({
      web: {
        borderLeftWidth: 1,
        borderLeftColor: Colors.border,
      },
      default: {
        elevation: 2,
      },
    }),
  },
});