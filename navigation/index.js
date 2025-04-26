import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

import HomeScreen from '../screens/HomeScreen';
import RecipeScreen from '../screens/RecipeScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
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
  // Configuración del linking para compatibilidad con GitHub Pages
  const linking = {
    prefixes: [
      'https://kenfuqnk.github.io/Julis-Cakes',
      Linking.createURL('/')
    ],
    config: {
      screens: {
        Home: '',
        Recipe: 'recipe/:id',
        NotFound: '*',
      },
    }
  };

  return (
    <NavigationContainer
      linking={linking}
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