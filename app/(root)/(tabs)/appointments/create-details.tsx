import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme-provider';
import { useGlobalContext } from '@/lib/global-provider';
import { appointmentService } from '@/lib/services/appointment';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TATTOO_SIZES = ['Küçük', 'Orta', 'Büyük', 'Çok Büyük'];
const TATTOO_STYLES = ['Minimal', 'Realistik', 'Traditional', 'Tribal'];
const BODY_PARTS = ['Kol', 'Bacak', 'Sırt', 'Göğüs', 'Bilek'];

export default function CreateAppointmentDetails() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string; time: string }>();
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  const [size, setSize] = useState('');
  const [style, setStyle] = useState('');
  const [placement, setPlacement] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!size || !style || !placement) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);

      const appointmentData = {
        clientId: user?.$id!,
        dateTime: `${params.date}T${params.time}:00.000Z`,
        designDetails: {
          size,
          style,
          placement,
        },
        notes,
        status: 'pending' as const,
      };

      const appointment =
        await appointmentService.createWithTimezone(appointmentData);

      if (appointment) {
        Alert.alert('Başarılı', 'Randevunuz oluşturuldu', [
          {
            text: 'Tamam',
            onPress: () => router.push('/appointments'),
          },
        ]);
      }
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      Alert.alert('Hata', 'Randevu oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          Dövme Detayları
        </Text>

        {/* Boyut Seçimi */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Boyut
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {TATTOO_SIZES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setSize(item)}
                className={`px-4 py-2 rounded-full ${
                  size === item
                    ? `bg-[${theme.colors.accent.primary}]`
                    : `bg-[${theme.colors.card.background(isDarkMode)}]`
                }`}
              >
                <Text
                  className={`font-rubik-medium ${
                    size === item
                      ? 'text-blue-950'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Stil Seçimi */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Stil
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {TATTOO_STYLES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setStyle(item)}
                className={`px-4 py-2 rounded-full ${
                  style === item
                    ? `bg-[${theme.colors.accent.primary}]`
                    : `bg-[${theme.colors.card.background(isDarkMode)}]`
                }`}
              >
                <Text
                  className={`font-rubik-medium ${
                    style === item
                      ? 'text-blue-950'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bölge Seçimi */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Bölge
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {BODY_PARTS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setPlacement(item)}
                className={`px-4 py-2 rounded-full ${
                  placement === item
                    ? `bg-[${theme.colors.accent.primary}]`
                    : `bg-[${theme.colors.card.background(isDarkMode)}]`
                }`}
              >
                <Text
                  className={`font-rubik-medium ${
                    placement === item
                      ? 'text-blue-950'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Kaydet Butonu */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className={`py-4 rounded-2xl ${
            loading
              ? `bg-[${theme.colors.accent.primary}]/50`
              : `bg-[${theme.colors.accent.primary}]`
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-blue-950 font-rubik-medium text-center">
              Randevu Oluştur
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
