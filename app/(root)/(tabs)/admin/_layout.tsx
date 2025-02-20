import { Redirect, Stack } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import { ActivityIndicator, View, Text } from 'react-native';
import { useTheme } from '@/lib/theme-provider';

export default function AdminLayout() {
  const { user, loading } = useGlobalContext();
  const { isDarkMode } = useTheme();

  const theme = {
    background: isDarkMode ? 'bg-[#121212]' : 'bg-[#FAFAFA]',
    text: {
      primary: isDarkMode ? 'text-[#FFFFFF]' : 'text-black-300',
      secondary: isDarkMode ? 'text-[#E0E0E0]' : 'text-black-100',
    },
    loading: {
      color: isDarkMode ? '#FFFFFF' : '#191D31',
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
      <Text className={`${theme.text.primary} text-lg font-rubik-medium`}>
        Admin Panel
      </Text>
    </Stack>
  );
}
