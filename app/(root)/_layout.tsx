import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/lib/global-provider';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { account } from '@/lib/appwrite';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme-provider';

export default function AppLayout() {
  const { loading, isLogged } = useGlobalContext();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const theme = {
    background: isDarkMode ? 'bg-[#121212]' : 'bg-[#FAFAFA]',
    text: isDarkMode ? 'text-white' : 'text-black-300',
    loading: {
      gradient: isDarkMode ? ['#1A1A1A', '#2A2A2A'] : ['#0061FF', '#60EFFF'],
    },
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.getSession('current');
      } catch (error) {
        router.replace('/sign-in');
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={theme.loading.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute w-full h-full"
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            color={isDarkMode ? '#E0E0E0' : '#fff'}
            size="large"
          />
          <Text className={`${theme.text} font-rubik-medium mt-4`}>
            Yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  if (!isLogged) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
        contentStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
