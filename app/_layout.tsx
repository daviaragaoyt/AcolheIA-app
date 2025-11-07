import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro/index" options={{ headerShown: false }} />
      <Stack.Screen name="home/index" options={{ headerShown: false }} />
      <Stack.Screen name="chat/index" options={{ headerShown: false }} />
    </Stack>
  );
}