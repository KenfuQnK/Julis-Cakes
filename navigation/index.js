import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import RecipeScreen from '../screens/RecipeScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import LinkingConfiguration from './LinkingConfiguration';
import Colors from '../constants/Colors';

// Crear los stacks de navegación
const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: '🎂 Julis Cakes',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Recipe" 
        component={RecipeScreen} 
        options={({ route }) => ({ 
          title: route.params.title,
          headerTitleAlign: 'center',
        })} 
      />
      <Stack.Screen 
        name="NotFound" 
        component={NotFoundScreen} 
        options={{ title: 'Oops!' }} 
      />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      // Personalización para web vs. móvil
      // En web, se usa el estilo de navegación diferente
      documentTitle={{
        formatter: (options, route) =>
          options?.title !== undefined
            ? `${options.title} - Julis Cakes`
            : 'Julis Cakes',
      }}>
      <RootNavigator />
    </NavigationContainer>
  );
}