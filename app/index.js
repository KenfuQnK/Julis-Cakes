// index.js (HomeScreen actualizado a Tailwind)
import { useRouter } from 'expo-router';
import { FlatList, TouchableOpacity, Text, View, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { recipes } from '../data/recipes';

export default function HomeScreen() {
  const router = useRouter();

  const handleRecipePress = (recipe) => {
    router.push(`/recipes/${recipe.id}`);
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-6 mb-4 rounded-md shadow-md border-l-4 border-primary"
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.7}
    >
      <Text className="text-accent text-base">{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="#FF7F6E" />
      <View className="flex-1 p-6 max-w-3xl w-full self-center bg-white my-6 rounded-2xl shadow-lg">
        <Text className="text-4xl font-bold text-primary text-center mb-4">🎂 Julis Cakes</Text>
        <Text className="text-xl font-bold mb-6">Recetas Disponibles</Text>

        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
        />

        <View className="mt-6 p-4 items-center">
          <Text className="text-gray-500">© 2025 Julis Cakes</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
