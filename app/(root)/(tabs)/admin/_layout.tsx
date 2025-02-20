import { Redirect, Stack } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import { ActivityIndicator, View, Text } from 'react-native';
import { useTheme } from '@/lib/theme-provider';

export default function AdminLayout() {
  const { user, loading } = useGlobalContext();
  const { isDarkMode, theme } = useTheme();

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center bg-[${theme.colors.background.primary(isDarkMode)}]`}
      >
        <ActivityIndicator color={theme.colors.text.primary(isDarkMode)} />
      </View>
    );
  }

  // Kullanıcı ve rol kontrolü
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background.primary(isDarkMode),
        },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Admin Panel',
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
