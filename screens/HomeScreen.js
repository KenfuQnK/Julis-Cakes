import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { recipes } from '../data/recipes';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Navegar a la pantalla de receta
  const handleRecipePress = (recipe) => {
    navigation.navigate('Recipe', { id: recipe.id, title: recipe.title });
  };

  // Renderizar cada elemento de la lista de recetas
  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.recipeItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <View style={styles.homeContainer}>
        <Text style={styles.title}>🎂 Julis Cakes</Text>
        <Text style={styles.subtitle}>Recetas Disponibles</Text>
        
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.recipesList}
        />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Julis Cakes</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  homeContainer: {
    flex: 1,
    padding: Layout.padding.large,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    marginVertical: Platform.OS === 'web' ? Layout.padding.large : 0,
    borderRadius: Platform.OS === 'web' ? Layout.borderRadius.large : 0,
    ...Platform.select({
      web: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      default: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: Layout.fontSize.xxlarge,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Layout.padding.medium,
  },
  subtitle: {
    fontSize: Layout.fontSize.large,
    fontWeight: 'bold',
    marginBottom: Layout.padding.large,
  },
  recipesList: {
    flexGrow: 1,
  },
  recipeItem: {
    backgroundColor: '#FFFFFF',
    padding: Layout.padding.large,
    marginBottom: Layout.padding.medium,
    borderRadius: Layout.borderRadius.medium,
    ...Platform.select({
      web: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      default: {
        elevation: 1,
      },
    }),
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  recipeItemText: {
    fontSize: Layout.fontSize.medium,
    color: Colors.accent,
  },
  footer: {
    marginTop: Layout.padding.large,
    padding: Layout.padding.medium,
    alignItems: 'center',
  },
  footerText: {
    color: '#777',
  },
});