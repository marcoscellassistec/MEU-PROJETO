import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../lib/store';
import { registerForPushNotifications } from '../lib/notifications';

export default function RootLayout() {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
    }
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: true, title: 'Assinatura' }} />
      </Stack>
    </>
  );
}
