import { View } from 'react-native';
import { Stack } from 'expo-router';
import Navbar from '@/components/navbar';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f9fafb' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="add" />
        <Stack.Screen name="statistics" />
        <Stack.Screen name="profile" />
      </Stack>
      <Navbar />
    </View>
  );
}
