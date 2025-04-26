import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

export default function NotFoundScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Oops!</Text>
      <Text style={styles.subtitle}>No encontramos esta página</Text>
      
      <View style={styles.emoji}>
        <Text style={styles.emojiText}>🍰</Text>
      </View>
      
      <Text style={styles.message}>
        Parece que el postre que estabas buscando no está en nuestra cocina.
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Volver al Inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.padding.large,
  },
  title: {
    fontSize: Layout.fontSize.xxlarge,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.padding.small,
  },
  subtitle: {
    fontSize: Layout.fontSize.large,
    marginBottom: Layout.padding.large,
    color: Colors.text,
  },
  emoji: {
    marginVertical: Layout.padding.large,
  },
  emojiText: {
    fontSize: 80,
  },
  message: {
    fontSize: Layout.fontSize.medium,
    textAlign: 'center',
    marginBottom: Layout.padding.large,
    maxWidth: 400,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.padding.large,
    paddingVertical: Layout.padding.medium,
    borderRadius: Layout.borderRadius.medium,
  },
  buttonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Layout.fontSize.medium,
  },
});