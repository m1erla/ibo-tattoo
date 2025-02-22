import { Redirect, Stack } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/lib/theme-provider';

export default function AdminLayout() {
  const { user, loading } = useGlobalContext();
  const { isDarkMode, theme } = useTheme();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={theme.colors.accent.primary} />
      </View>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background.primary(isDarkMode),
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="portfolio-management"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="appointments-management"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="analytics" options={{ headerShown: false }} />
      <Stack.Screen name="client-management" options={{ headerShown: false }} />
      <Stack.Screen name="payments" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="client/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
