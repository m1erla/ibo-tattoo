import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme-provider';
import { clientService, Client } from '@/lib/services/client';
import { appointmentService } from '@/lib/services/appointment';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FlashList } from '@shopify/flash-list';
import { Query } from 'react-native-appwrite';

export default function ClientDetail() {
  const { id } = useLocalSearchParams();
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadClientDetails();
  }, [id]);

  const loadClientDetails = async () => {
    try {
      setLoading(true);
      const clientData = await clientService.getClientDetails(id as string);
      setClient(clientData as Client);
      setNotes(clientData.notes || '');

      // Randevuları getir
      const appointmentsResponse = await appointmentService.list([
        Query.equal('clientId', id as string),
        Query.orderDesc('dateTime'),
        Query.limit(10),
      ]);
      setAppointments(appointmentsResponse.documents);
    } catch (error) {
      console.error('Müşteri detayları yükleme hatası:', error);
      Alert.alert('Hata', 'Müşteri bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await clientService.updateNotes(id as string, notes);
      Alert.alert('Başarılı', 'Notlar kaydedildi');
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
      Alert.alert('Hata', 'Notlar kaydedilirken bir hata oluştu');
    }
  };

  if (loading || !client) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1 p-4">
        {/* Müşteri Başlığı */}
        <View className="mb-6">
          <Text
            className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            {client.name}
          </Text>
          <Text
            className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
          >
            {client.email}
          </Text>
          {client.phone && (
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              {client.phone}
            </Text>
          )}
        </View>

        {/* İstatistikler */}
        <View className="flex-row justify-between mb-6">
          <View
            className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] flex-1 mr-2`}
          >
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              Toplam Randevu
            </Text>
            <Text
              className={`text-xl font-rubik-bold text-[${theme.colors.accent.primary}]`}
            >
              {client.appointmentCount}
            </Text>
          </View>
          <View
            className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] flex-1 ml-2`}
          >
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              Toplam Harcama
            </Text>
            <Text
              className={`text-xl font-rubik-bold text-[${theme.colors.accent.primary}]`}
            >
              {client.totalSpent?.toLocaleString('tr-TR') || '0'} ₺
            </Text>
          </View>
        </View>

        {/* Tercihler */}
        {client.preferences && (
          <View
            className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] mb-6`}
          >
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
            >
              Tercihler
            </Text>
            {client.preferences.favoriteStyles && (
              <View className="mb-2">
                <Text
                  className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Favori Stiller:
                </Text>
                <View className="flex-row flex-wrap mt-1">
                  {client.preferences.favoriteStyles.map((style, index) => (
                    <View
                      key={index}
                      className={`px-3 py-1 rounded-full bg-[${theme.colors.accent.primary}]/20 mr-2 mb-2`}
                    >
                      <Text
                        className={`text-sm text-[${theme.colors.accent.primary}]`}
                      >
                        {style}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {client.preferences.specialRequirements && (
              <Text
                className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
              >
                Özel İstekler: {client.preferences.specialRequirements}
              </Text>
            )}
          </View>
        )}

        {/* Notlar */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
          >
            Notlar
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
            placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
          />
          <Pressable
            onPress={handleSaveNotes}
            className={`mt-2 p-3 rounded-xl bg-[${theme.colors.accent.primary}]`}
          >
            <Text className="text-white text-center font-rubik-medium">
              Notları Kaydet
            </Text>
          </Pressable>
        </View>

        {/* Randevu Geçmişi */}
        <View>
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
          >
            Randevu Geçmişi
          </Text>
          {appointments.map((appointment) => (
            <View
              key={appointment.$id}
              className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] mb-2`}
            >
              <Text
                className={`text-[${theme.colors.text.primary(isDarkMode)}]`}
              >
                {format(new Date(appointment.dateTime), 'd MMMM yyyy HH:mm', {
                  locale: tr,
                })}
              </Text>
              <Text
                className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
              >
                {appointment.designDetails.style} -{' '}
                {appointment.designDetails.size}
              </Text>
              <Text
                className={`text-sm font-rubik-medium text-[${theme.colors.accent.primary}]`}
              >
                {appointment.price.toLocaleString('tr-TR')} ₺
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
