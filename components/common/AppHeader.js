// AppHeader.js (actualizado a Tailwind)
import React from 'react';
import { View, Text } from 'react-native';

// Componente para el encabezado de secciones en la aplicación
export default function AppHeader({ title, style }) {
  return (
    <View className={"my-4 " + (style || "")}>
      <Text className="text-lg font-bold text-white uppercase">
        {title}
      </Text>
    </View>
  );
}
