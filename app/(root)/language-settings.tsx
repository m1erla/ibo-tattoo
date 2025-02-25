import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { useRouter } from 'expo-router';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/lib/services/language';
import { useGlobalContext } from '@/lib/global-provider';
import icons from '@/constants/icons';

export default function LanguageSettings() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const { locale, changeLanguage, t } = useLanguage();
  const { user } = useGlobalContext();

  // Dil bayrakları
  const flags: Record<string, any> = {
    tr: require('@/assets/images/flags/tr.png'),
    en: require('@/assets/images/flags/en.png'),
    de: require('@/assets/images/flags/de.png'),
    nl: require('@/assets/images/flags/nl.png'),
  };

  const handleLanguageChange = async (code: string) => {
    try {
      await changeLanguage(code);

      if (user) {
        // Kullanıcı tercihlerini güncelleyebiliriz
        // Bu kısmı kendi kullanıcı tercihleri servisi ile entegre edin
      }
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Image
              source={icons.backArrow}
              style={{
                width: 24,
                height: 24,
                tintColor: theme.colors.text.primary(isDarkMode),
              }}
            />
          </Pressable>
          <Text
            className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            {t('common.language')}
          </Text>
        </View>

        <Text
          className={`mb-4 text-[${theme.colors.text.secondary(isDarkMode)}]`}
        >
          {t('settings.chooseLanguage')}
        </Text>

        <View className="space-y-3">
          {SUPPORTED_LANGUAGES.map((language) => (
            <Pressable
              key={language.code}
              onPress={() => handleLanguageChange(language.code)}
              className={`p-4 rounded-xl flex-row items-center justify-between ${
                locale === language.code
                  ? `bg-[${theme.colors.accent.primary}]/10 border border-[${theme.colors.accent.primary}]`
                  : `bg-[${theme.colors.card.background(isDarkMode)}]`
              }`}
            >
              <View className="flex-row items-center">
                <Image
                  source={flags[language.code]}
                  style={{ width: 24, height: 24, borderRadius: 12 }}
                />
                <Text
                  className={`ml-3 font-rubik-medium text-[${
                    locale === language.code
                      ? theme.colors.accent.primary
                      : theme.colors.text.primary(isDarkMode)
                  }]`}
                >
                  {language.name}
                </Text>
              </View>

              {locale === language.code && (
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center bg-[${theme.colors.accent.primary}]`}
                >
                  <Image
                    source={icons.check}
                    style={{ width: 14, height: 14, tintColor: 'white' }}
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
