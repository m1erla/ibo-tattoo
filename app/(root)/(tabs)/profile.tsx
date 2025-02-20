import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGlobalContext } from '@/lib/global-provider';
import { useRouter } from 'expo-router';
import icons from '@/constants/icons';
import { useTheme } from '@/lib/theme-provider';

export default function Profile() {
  const { user, logout, refetch } = useGlobalContext();
  const router = useRouter();
  const { isDarkMode, theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text
            className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            Profil
          </Text>
        </View>

        {/* Profil Bilgileri */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mt-6 px-4"
        >
          <View
            className={`p-4 rounded-2xl ${theme.colors.card.background(isDarkMode)}`}
          >
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
            >
              {user?.name}
            </Text>
            <Text
              className={`text-[${theme.colors.text.secondary(isDarkMode)}] mt-1`}
            >
              {user?.email}
            </Text>
          </View>
        </Animated.View>

        {/* Ayarlar */}
        <View className="mt-6 px-4">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Ayarlar
          </Text>

          <View
            className={`rounded-2xl ${theme.colors.card.background(isDarkMode)}`}
          >
            <Pressable className="p-4 flex-row items-center justify-between border-b border-gray-100">
              <Text className="font-rubik text-black-300">Bildirimler</Text>
              <Switch />
            </Pressable>

            <Pressable className="p-4 flex-row items-center justify-between">
              <Text className="font-rubik text-black-300">Dil</Text>
              <Text className="font-rubik text-black-100">Türkçe</Text>
            </Pressable>

            <Pressable
              onPress={toggleTheme}
              className={`flex-row items-center justify-between p-4 rounded-xl ${theme.colors.card.background(isDarkMode)}`}
            >
              <Text
                className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
              >
                Koyu Tema
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border.primary(false),
                  true: theme.colors.accent.primary,
                }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#F4F4F4'}
              />
            </Pressable>
          </View>
        </View>

        {/* Çıkış Butonu */}
        <View className="mt-6 px-4 pb-8">
          <Pressable
            onPress={handleLogout}
            className={`p-4 rounded-2xl bg-[${theme.colors.status.cancelled.background(isDarkMode)}]`}
          >
            <Text
              className={`text-[${theme.colors.status.cancelled.text(isDarkMode)}] text-center font-rubik-medium`}
            >
              Çıkış Yap
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
