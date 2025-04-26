import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Componente para mostrar cada paso de la receta como una tarjeta
export default function StepCard({ step, index }) {
  return (
    <Card style={styles.stepCard}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>Paso {index + 1}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image 
          source={step.image}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{step.description}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    height: Layout.cardSizes.step.height,
    width: Layout.cardSizes.step.width,
    margin: 4,
    position: 'relative',
  },
  numberContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 4,
    borderRadius: Layout.borderRadius.small,
    zIndex: 1,
  },
  number: {
    fontSize: Layout.fontSize.small,
    fontWeight: 'bold',
    color: Colors.text,
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