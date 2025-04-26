import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Componente para el encabezado de secciones en la aplicación
export default function AppHeader({ title, style }) {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: Layout.padding.medium,
  },
  title: {
    fontSize: Layout.fontSize.large,
    fontWeight: 'bold',
    color: Colors.textLight,
    textTransform: 'uppercase',
  }
});