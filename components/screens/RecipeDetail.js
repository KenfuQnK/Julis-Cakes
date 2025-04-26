import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, useWindowDimensions } from 'react-native';
import AppHeader from '../common/AppHeader';
import IngredientCard from '../common/IngredientCard';
import StepCard from '../common/StepCard';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Componente para mostrar el detalle de una receta
export default function RecipeDetail({ recipe }) {
  const { width } = useWindowDimensions();
  
  // Determina cuántas columnas mostrar según el ancho de la pantalla
  const getNumColumns = () => {
    if (width < 480) return 3;
    if (width < 768) return 4;
    if (width < 1200) return 5;
    return 8; 
  };

  // Renderiza la sección de ingredientes
  const renderIngredients = () => (
    <View>
      <AppHeader title="Ingredientes" />
      <FlatList
        data={recipe.ingredients}
        renderItem={({ item }) => <IngredientCard ingredient={item} />}
        keyExtractor={(item, index) => `ingredient-${index}`}
        numColumns={getNumColumns()}
        contentContainerStyle={styles.cardsContainer}
      />
    </View>
  );

  // Renderiza la sección de pasos
  const renderSteps = () => (
    <View>
      <AppHeader title="Instrucciones" />
      <FlatList
        data={recipe.steps}
        renderItem={({ item, index }) => <StepCard step={item} index={index} />}
        keyExtractor={(item, index) => `step-${index}`}
        numColumns={getNumColumns()}
        contentContainerStyle={styles.cardsContainer}
      />
    </View>
  );

  // Renderiza la sección de consejos (si existen)
  const renderTips = () => {
    if (!recipe.tips || recipe.tips.length === 0) return null;
    
    return (
      <View>
        <AppHeader title="Consejos" />
        <FlatList
          data={recipe.tips}
          renderItem={({ item }) => (
            <IngredientCard 
              ingredient={{ name: item.tip, image: item.image }} 
            />
          )}
          keyExtractor={(item, index) => `tip-${index}`}
          numColumns={getNumColumns()}
          contentContainerStyle={styles.cardsContainer}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      
      {renderIngredients()}
      {renderSteps()}
      {renderTips()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  contentContainer: {
    padding: Layout.padding.large,
  },
  recipeTitle: {
    fontSize: Layout.fontSize.xxlarge,
    fontWeight: 'bold',
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Layout.padding.large,
    textTransform: 'uppercase',
  },
  cardsContainer: {
    paddingBottom: Layout.padding.large,
  },
});