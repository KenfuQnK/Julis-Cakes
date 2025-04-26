import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

export default function IngredientCard({ ingredient }) {
  return (
    <Card style={styles.ingredientCard}>
      {/* Contenedor de imagen que se puede superponer */}
      <View style={styles.imageContainer}>
        <Image 
          source={ingredient.image}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      {/* Contenedor de texto que va desde abajo y puede crecer hacia arriba */}
      <View style={styles.textContainer}>
        <Text style={styles.text} numberOfLines={3}>
          {ingredient.name}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  ingredientCard: {
    height: Layout.cardSizes.ingredient.height,
    width: Layout.cardSizes.ingredient.width,
    margin: 4,
    position: 'relative',
  },
  imageContainer: {
    height: '75%',
    // width: '100%',
    // padding: 8,
    position: 'absolute', // Posicionamiento absoluto
    top: 0,
    left: 0,
    right: 0,
    // bottom: 0, // Cubre toda la tarjeta
    padding: 8,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: Layout.borderRadius.small,
  },
  textContainer: {
    position: 'absolute', // Posicionamiento absoluto
    bottom: 0, // Comienza desde abajo
    left: 0,
    right: 0,
    padding: 8,
    // backgroundColor: 'rgba(255, 244, 237, 0.5)', // Fondo semi-transparente
    borderBottomLeftRadius: Layout.borderRadius.medium,
    borderBottomRightRadius: Layout.borderRadius.medium,
    zIndex: 2, // Mayor que la imagen para que se superponga
    flexGrow: 1, // Permite crecer
    justifyContent: 'flex-end', // Alinea el contenido al final (abajo)
    // padding: 8,
    // height: '25%',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Layout.fontSize.small,
    color: Colors.text,
  }
});