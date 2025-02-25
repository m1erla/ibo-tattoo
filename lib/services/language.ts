import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import trTranslations from '@/locales/tr.json';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';
import nlTranslations from '@/locales/nl.json';

// Desteklenen diller
export const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'nl', name: 'Nederlands' },
];

// Çeviriler
const translations = {
  tr: trTranslations,
  en: enTranslations,
  de: deTranslations,
  nl: nlTranslations,
};

// i18n instance
const i18n = new I18n(translations);

// Default locale
i18n.locale = Localization.locale.split('-')[0];
i18n.enableFallback = true;
i18n.defaultLocale = 'tr';

export const useLanguage = () => {
  const [locale, setLocale] = useState(i18n.locale);
  
  useEffect(() => {
    loadSavedLanguage();
  }, []);
  
  const loadSavedLanguage = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem('userLanguage');
      if (savedLocale) {
        changeLanguage(savedLocale);
      } else {
        // Sistem diline göre varsayılan dil
        const deviceLocale = Localization.locale.split('-')[0];
        // Desteklenen dil mi kontrol et
        if (Object.keys(translations).includes(deviceLocale)) {
          changeLanguage(deviceLocale);
        }
      }
    } catch (error) {
      console.error('Dil yükleme hatası:', error);
    }
  };
  
  const changeLanguage = async (languageCode: string) => {
    try {
      i18n.locale = languageCode;
      setLocale(languageCode);
      await AsyncStorage.setItem('userLanguage', languageCode);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };
  
  return {
    locale,
    changeLanguage,
    t: (key: string, options?: object) => i18n.t(key, options),
    languages: SUPPORTED_LANGUAGES,
  };
}; 