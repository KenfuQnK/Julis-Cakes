import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Componente para mostrar una receta en la lista de recetas
export default function RecipeCard({ recipe, isActive = false }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Recipe', { 
      id: recipe.id,
      title: recipe.title
    });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.recipeCard,
        isActive && styles.activeCard
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{recipe.title}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Text style={styles.imageText}>imagen</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.padding.medium,
    height: Layout.cardSizes.recipe.height,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  activeCard: {
    backgroundColor: Colors.activeCardBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  textContainer: {
    flex: 1,
    padding: Layout.padding.medium,
    justifyContent: 'center',
  },
  title: {
    fontSize: Layout.fontSize.medium,
    color: Colors.text,
  },
  imageContainer: {
    width: 80,
    height: '100%',
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  }
});