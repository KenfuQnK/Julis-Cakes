import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import Navigation from './navigation';
import Colors from './constants/Colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Navigation />
        <StatusBar style="light" backgroundColor={Colors.primary} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});