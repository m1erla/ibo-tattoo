import { Redirect, Stack } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/lib/theme-provider';

export default function AdminLayout() {
  const { user, loading } = useGlobalContext();
  const { isDarkMode } = useTheme();

  const theme = {
    background: isDarkMode ? 'bg-[#121212]' : 'bg-[#FAFAFA]',
    loading: {
      color: isDarkMode ? '#E0E0E0' : '#191D31',
    },
  };

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${theme.background}`}
      >
        <ActivityIndicator color={theme.loading.color} />
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
          backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
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
