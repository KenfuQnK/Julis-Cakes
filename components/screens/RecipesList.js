import React from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import RecipeCard from '../common/RecipeCard';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Componente para mostrar la lista de recetas
export default function RecipesList({ recipes, currentRecipeId }) {
  const { width } = useWindowDimensions();

  // Comprobar si estamos en dispositivo móvil
  const isMobile = width < 768;
  
  // Renderizar cada tarjeta de receta
  const renderRecipeCard = ({ item }) => (
    <RecipeCard 
      recipe={item} 
      isActive={item.id === currentRecipeId}
    />
  );

  return (
    <View style={[
      styles.container,
      isMobile ? styles.mobileContainer : {}
    ]}>
      <Text style={styles.title}>Listado de recetas</Text>
      
      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.recipeListBg,
    padding: Layout.padding.medium,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  mobileContainer: {
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Layout.fontSize.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.padding.large,
    color: Colors.text,
  },
  listContent: {
    paddingVertical: Layout.padding.small,
  }
});