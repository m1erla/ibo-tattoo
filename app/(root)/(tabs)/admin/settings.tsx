import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { useGlobalContext } from '@/lib/global-provider';
import * as ImagePicker from 'expo-image-picker';
import { storage, databases, appwriteConfig } from '@/lib/appwrite';
import { ID } from 'react-native-appwrite';
import icons from '@/constants/icons';
import images from '@/constants/images';

export default function Settings() {
  const { isDarkMode, theme } = useTheme();
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [savingData, setSavingData] = useState(false);

  const [activeTab, setActiveTab] = useState('storeInfo');

  // Mağaza Bilgileri
  const [storeSettings, setStoreSettings] = useState({
    name: 'İbo Tattoo',
    address: 'Atatürk Cad. No:123, İstanbul',
    phone: '+90 555 123 4567',
    email: 'contact@ibotattoo.com',
    instagramUrl: 'instagram.com/ibotattoo',
    facebookUrl: 'facebook.com/ibotattoo',
    websiteUrl: 'www.ibotattoo.com',
    latitude: '41.0082',
    longitude: '28.9784',
    description:
      'İbo Tattoo, profesyonel dövme ve piercing hizmetleri sunan bir stüdyodur.',
    logo: null as string | null,
  });

  // Çalışma Saatleri
  const [workingHours, setWorkingHours] = useState({
    monday: { open: '10:00', close: '18:00', isOpen: true },
    tuesday: { open: '10:00', close: '18:00', isOpen: true },
    wednesday: { open: '10:00', close: '18:00', isOpen: true },
    thursday: { open: '10:00', close: '18:00', isOpen: true },
    friday: { open: '10:00', close: '18:00', isOpen: true },
    saturday: { open: '10:00', close: '16:00', isOpen: true },
    sunday: { open: '10:00', close: '14:00', isOpen: false },
  });

  // Bildirim Ayarları
  const [notificationSettings, setNotificationSettings] = useState({
    newAppointment: true,
    appointmentReminder: true,
    cancelledAppointment: true,
    newMessage: true,
    paymentConfirmation: true,
  });

  // Dil Ayarları
  const [languageSettings, setLanguageSettings] = useState({
    defaultLanguage: 'tr',
    supportedLanguages: ['tr', 'en', 'de', 'nl'] as string[],
    languageActive: {
      tr: true,
      en: true,
      de: true,
      nl: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Mağaza ayarlarını yükle
      const storeDoc = await databases
        .getDocument(appwriteConfig.databaseId!, 'settings', 'store_settings')
        .catch(() => null);

      if (storeDoc) {
        setStoreSettings((prev) => ({
          ...prev,
          ...JSON.parse(storeDoc.value || '{}'),
        }));
      }

      // Çalışma saatleri
      const hoursDoc = await databases
        .getDocument(appwriteConfig.databaseId!, 'settings', 'working_hours')
        .catch(() => null);

      if (hoursDoc) {
        setWorkingHours((prev) => ({
          ...prev,
          ...JSON.parse(hoursDoc.value || '{}'),
        }));
      }

      // Dil ayarları
      const languageDoc = await databases
        .getDocument(
          appwriteConfig.databaseId!,
          'settings',
          'language_settings'
        )
        .catch(() => null);

      if (languageDoc) {
        setLanguageSettings((prev) => ({
          ...prev,
          ...JSON.parse(languageDoc.value || '{}'),
        }));
      }

      // Bildirim ayarları
      const notificationDoc = await databases
        .getDocument(
          appwriteConfig.databaseId!,
          'settings',
          'notification_settings'
        )
        .catch(() => null);

      if (notificationDoc) {
        setNotificationSettings((prev) => ({
          ...prev,
          ...JSON.parse(notificationDoc.value || '{}'),
        }));
      }
    } catch (error) {
      console.error('Ayarlar yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (user?.role !== 'admin') {
      Alert.alert('Hata', 'Bu işlem için yetkiniz yok');
      return;
    }

    try {
      setSavingData(true);

      // Mağaza ayarlarını kaydet
      await databases
        .updateDocument(
          appwriteConfig.databaseId!,
          'settings',
          'store_settings',
          {
            value: JSON.stringify(storeSettings),
          }
        )
        .catch(() =>
          databases.createDocument(
            appwriteConfig.databaseId!,
            'settings',
            'store_settings',
            {
              value: JSON.stringify(storeSettings),
            }
          )
        );

      // Çalışma saatlerini kaydet
      await databases
        .updateDocument(
          appwriteConfig.databaseId!,
          'settings',
          'working_hours',
          {
            value: JSON.stringify(workingHours),
          }
        )
        .catch(() =>
          databases.createDocument(
            appwriteConfig.databaseId!,
            'settings',
            'working_hours',
            {
              value: JSON.stringify(workingHours),
            }
          )
        );

      // Dil ayarlarını kaydet
      await databases
        .updateDocument(
          appwriteConfig.databaseId!,
          'settings',
          'language_settings',
          {
            value: JSON.stringify(languageSettings),
          }
        )
        .catch(() =>
          databases.createDocument(
            appwriteConfig.databaseId!,
            'settings',
            'language_settings',
            {
              value: JSON.stringify(languageSettings),
            }
          )
        );

      // Bildirim ayarlarını kaydet
      await databases
        .updateDocument(
          appwriteConfig.databaseId!,
          'settings',
          'notification_settings',
          {
            value: JSON.stringify(notificationSettings),
          }
        )
        .catch(() =>
          databases.createDocument(
            appwriteConfig.databaseId!,
            'settings',
            'notification_settings',
            {
              value: JSON.stringify(notificationSettings),
            }
          )
        );

      Alert.alert('Başarılı', 'Ayarlar kaydedildi');
    } catch (error) {
      console.error('Ayarlar kaydetme hatası:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir sorun oluştu');
    } finally {
      setSavingData(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const imageUri = result.assets[0].uri;

        // Logo yükleme
        const fileId = ID.unique();
        await storage.createFile(appwriteConfig.storageBucketId!, fileId, {
          name: 'logo.jpg',
          type: 'image/jpeg',
          size: 0,
          uri: imageUri,
        });

        const logoUrl = storage
          .getFilePreview(appwriteConfig.storageBucketId!, fileId)
          .toString();

        setStoreSettings((prev) => ({
          ...prev,
          logo: logoUrl,
        }));
      } catch (error) {
        console.error('Resim yükleme hatası:', error);
        Alert.alert('Hata', 'Logo yüklenirken bir sorun oluştu');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const languageNames = {
    tr: 'Türkçe',
    en: 'English',
    de: 'Deutsch',
    nl: 'Nederlands',
  };

  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar',
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          Ayarlar
        </Text>

        {/* Tab Menü */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {[
            { id: 'storeInfo', title: 'Mağaza Bilgileri' },
            { id: 'workingHours', title: 'Çalışma Saatleri' },
            { id: 'languages', title: 'Dil Ayarları' },
            { id: 'notifications', title: 'Bildirimler' },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`px-4 py-2 mr-2 rounded-full ${
                activeTab === tab.id
                  ? `bg-[${theme.colors.accent.primary}]`
                  : `bg-[${theme.colors.card.background(isDarkMode)}]`
              }`}
            >
              <Text
                className={`font-rubik-medium ${
                  activeTab === tab.id
                    ? 'text-white'
                    : `text-[${theme.colors.text.primary(isDarkMode)}]`
                }`}
              >
                {tab.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Mağaza Bilgileri Formu */}
        {activeTab === 'storeInfo' && (
          <View>
            <View className="mb-6 items-center">
              <Pressable
                onPress={pickImage}
                className={`w-32 h-32 rounded-full justify-center items-center overflow-hidden ${
                  storeSettings.logo
                    ? ''
                    : `bg-[${theme.colors.card.background(isDarkMode)}]`
                }`}
              >
                {storeSettings.logo ? (
                  <Image
                    source={{ uri: storeSettings.logo }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="items-center">
                    <Image
                      source={icons.gallery}
                      className="w-8 h-8 mb-2"
                      style={{
                        tintColor: theme.colors.text.secondary(isDarkMode),
                      }}
                    />
                    <Text
                      className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
                    >
                      Logo Ekle
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View className="space-y-4">
              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Mağaza Adı
                </Text>
                <TextInput
                  value={storeSettings.name}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({ ...prev, name: text }))
                  }
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Adres
                </Text>
                <TextInput
                  value={storeSettings.address}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({ ...prev, address: text }))
                  }
                  multiline
                  numberOfLines={2}
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Telefon
                </Text>
                <TextInput
                  value={storeSettings.phone}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({ ...prev, phone: text }))
                  }
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  E-posta
                </Text>
                <TextInput
                  value={storeSettings.email}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({ ...prev, email: text }))
                  }
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Instagram
                </Text>
                <TextInput
                  value={storeSettings.instagramUrl}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      instagramUrl: text,
                    }))
                  }
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Facebook
                </Text>
                <TextInput
                  value={storeSettings.facebookUrl}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({ ...prev, facebookUrl: text }))
                  }
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Web Sitesi
                </Text>
                <TextInput
                  value={storeSettings.websiteUrl}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({ ...prev, websiteUrl: text }))
                  }
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Açıklama
                </Text>
                <TextInput
                  value={storeSettings.description}
                  onChangeText={(text) =>
                    setStoreSettings((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                  numberOfLines={3}
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                  placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
                />
              </View>

              {/* Konum Bilgisi */}
              <View className="flex-row space-x-2">
                <View className="flex-1">
                  <Text
                    className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                  >
                    Enlem
                  </Text>
                  <TextInput
                    value={storeSettings.latitude}
                    onChangeText={(text) =>
                      setStoreSettings((prev) => ({ ...prev, latitude: text }))
                    }
                    className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                    placeholderTextColor={theme.colors.text.secondary(
                      isDarkMode
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                  >
                    Boylam
                  </Text>
                  <TextInput
                    value={storeSettings.longitude}
                    onChangeText={(text) =>
                      setStoreSettings((prev) => ({ ...prev, longitude: text }))
                    }
                    className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                    placeholderTextColor={theme.colors.text.secondary(
                      isDarkMode
                    )}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Çalışma Saatleri */}
        {activeTab === 'workingHours' && (
          <View className="space-y-4">
            {Object.entries(workingHours).map(([day, hours]) => (
              <View
                key={day}
                className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
                  >
                    {dayNames[day as keyof typeof dayNames]}
                  </Text>
                  <View className="flex-row items-center">
                    <Text
                      className={`mr-2 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                    >
                      Açık
                    </Text>
                    <Switch
                      value={hours.isOpen}
                      onValueChange={(value) =>
                        setWorkingHours((prev) => ({
                          ...prev,
                          [day]: {
                            ...prev[day as keyof typeof prev],
                            isOpen: value,
                          },
                        }))
                      }
                      trackColor={{
                        false: theme.colors.border.primary(isDarkMode),
                        true: theme.colors.accent.primary,
                      }}
                      thumbColor={isDarkMode ? '#FFFFFF' : '#F4F4F4'}
                    />
                  </View>
                </View>

                {hours.isOpen && (
                  <View className="flex-row items-center space-x-2">
                    <View className="flex-1">
                      <Text
                        className={`text-xs mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                      >
                        Açılış
                      </Text>
                      <TextInput
                        value={hours.open}
                        onChangeText={(text) =>
                          setWorkingHours((prev) => ({
                            ...prev,
                            [day]: {
                              ...prev[day as keyof typeof prev],
                              open: text,
                            },
                          }))
                        }
                        className={`p-3 rounded-xl bg-[${theme.colors.background.primary(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                        placeholderTextColor={theme.colors.text.secondary(
                          isDarkMode
                        )}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-xs mb-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                      >
                        Kapanış
                      </Text>
                      <TextInput
                        value={hours.close}
                        onChangeText={(text) =>
                          setWorkingHours((prev) => ({
                            ...prev,
                            [day]: {
                              ...prev[day as keyof typeof prev],
                              close: text,
                            },
                          }))
                        }
                        className={`p-3 rounded-xl bg-[${theme.colors.background.primary(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                        placeholderTextColor={theme.colors.text.secondary(
                          isDarkMode
                        )}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Dil Ayarları */}
        {activeTab === 'languages' && (
          <View className="space-y-4">
            <View>
              <Text
                className={`text-sm mb-3 text-[${theme.colors.text.secondary(isDarkMode)}]`}
              >
                Varsayılan Dil
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {languageSettings.supportedLanguages.map((lang) => (
                  <Pressable
                    key={lang}
                    onPress={() =>
                      setLanguageSettings((prev) => ({
                        ...prev,
                        defaultLanguage: lang,
                      }))
                    }
                    className={`px-4 py-2 rounded-full ${
                      languageSettings.defaultLanguage === lang
                        ? `bg-[${theme.colors.accent.primary}]`
                        : `bg-[${theme.colors.card.background(isDarkMode)}]`
                    }`}
                  >
                    <Text
                      className={`font-rubik-medium ${
                        languageSettings.defaultLanguage === lang
                          ? 'text-white'
                          : `text-[${theme.colors.text.primary(isDarkMode)}]`
                      }`}
                    >
                      {languageNames[lang as keyof typeof languageNames]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text
                className={`text-sm mb-3 text-[${theme.colors.text.secondary(isDarkMode)}]`}
              >
                Desteklenen Diller
              </Text>
              {Object.entries(languageSettings.languageActive).map(
                ([lang, isActive]) => (
                  <View
                    key={lang}
                    className={`flex-row justify-between items-center p-4 mb-2 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
                  >
                    <Text
                      className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
                    >
                      {languageNames[lang as keyof typeof languageNames]}
                    </Text>
                    <Switch
                      value={isActive}
                      onValueChange={(value) => {
                        // Varsayılan dil her zaman aktif olmalıdır
                        if (
                          lang === languageSettings.defaultLanguage &&
                          !value
                        ) {
                          Alert.alert(
                            'Uyarı',
                            'Varsayılan dil devre dışı bırakılamaz'
                          );
                          return;
                        }

                        setLanguageSettings((prev) => ({
                          ...prev,
                          languageActive: {
                            ...prev.languageActive,
                            [lang]: value,
                          },
                        }));
                      }}
                      trackColor={{
                        false: theme.colors.border.primary(isDarkMode),
                        true: theme.colors.accent.primary,
                      }}
                      thumbColor={isDarkMode ? '#FFFFFF' : '#F4F4F4'}
                    />
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {/* Bildirim Ayarları */}
        {activeTab === 'notifications' && (
          <View className="space-y-4">
            {[
              {
                id: 'newAppointment',
                title: 'Yeni Randevu Bildirimleri',
                description: 'Yeni bir randevu talebi geldiğinde bildirim al',
              },
              {
                id: 'appointmentReminder',
                title: 'Randevu Hatırlatıcıları',
                description: 'Randevulardan önce hatırlatıcı bildirimler al',
              },
              {
                id: 'cancelledAppointment',
                title: 'İptal Bildirimleri',
                description: 'Randevular iptal edildiğinde bildirim al',
              },
              {
                id: 'newMessage',
                title: 'Mesaj Bildirimleri',
                description: 'Yeni mesajlar geldiğinde bildirim al',
              },
              {
                id: 'paymentConfirmation',
                title: 'Ödeme Bildirimleri',
                description: 'Ödemeler tamamlandığında bildirim al',
              },
            ].map((setting) => (
              <View
                key={setting.id}
                className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text
                      className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
                    >
                      {setting.title}
                    </Text>
                    <Text
                      className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}] mt-1`}
                    >
                      {setting.description}
                    </Text>
                  </View>
                  <Switch
                    value={
                      notificationSettings[
                        setting.id as keyof typeof notificationSettings
                      ]
                    }
                    onValueChange={(value) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        [setting.id]: value,
                      }))
                    }
                    trackColor={{
                      false: theme.colors.border.primary(isDarkMode),
                      true: theme.colors.accent.primary,
                    }}
                    thumbColor={isDarkMode ? '#FFFFFF' : '#F4F4F4'}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Kaydet Butonu */}
        <Pressable
          onPress={saveSettings}
          disabled={savingData}
          className={`mt-6 p-4 rounded-xl ${
            savingData
              ? `bg-[${theme.colors.accent.primary}]/50`
              : `bg-[${theme.colors.accent.primary}]`
          }`}
        >
          {savingData ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-rubik-medium">
              Ayarları Kaydet
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
