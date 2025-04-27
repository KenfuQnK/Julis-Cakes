// not-found.js (pantalla 404 actualizada a Tailwind)
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <Text className="text-4xl font-bold text-primary mb-2">¡Oops!</Text>
      <Text className="text-xl mb-6 text-text">No encontramos esta página</Text>

      <View className="my-6">
        <Text className="text-6xl">🍰</Text>
      </View>

      <Text className="text-base text-center mb-6 max-w-sm text-text">
        Parece que el postre que estabas buscando no está en nuestra cocina.
      </Text>

      <TouchableOpacity
        className="bg-primary px-6 py-3 rounded-md"
        onPress={() => router.replace('/')}
      >
        <Text className="text-white font-bold text-base">Volver al Inicio</Text>
      </TouchableOpacity>
    </View>
  );
}
