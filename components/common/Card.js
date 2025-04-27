// Card.js (actualizado a Tailwind)
import React from 'react';
import { View } from 'react-native';

// Componente base para todas las tarjetas de la aplicación
export default function Card({ children, style }) {
  return (
    <View className={"bg-card rounded-md overflow-hidden shadow-md " + (style || "")}>
      {children}
    </View>
  );
}