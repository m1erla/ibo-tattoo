import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { appointmentService } from '@/lib/services/appointment';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Query } from 'react-native-appwrite';
import { FlashList } from '@shopify/flash-list';
import { SwipeableRow } from '@/components/SwipeableRow';
import { useRouter } from 'expo-router';
import icons from '@/constants/icons';

export default function AppointmentsManagement() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const queries: any[] = [Query.orderDesc('dateTime')];

      // Durum filtresi
      if (filter !== 'all') {
        queries.push(Query.equal('status', filter));
      }

      // Arama filtresi
      if (search) {
        queries.push(Query.search('clientName', search));
      }

      const response = await appointmentService.list(queries);
      setAppointments(response.documents);
    } catch (error) {
      console.error('Randevuları getirme hatası:', error);
      Alert.alert('Hata', 'Randevular yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setLoading(true);
      await appointmentService.update(id, { status: newStatus as any });
      Alert.alert('Başarılı', 'Randevu durumu güncellendi');
      loadAppointments();
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      Alert.alert('Hata', 'Randevu durumu güncellenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderAppointmentItem = ({ item }: { item: any }) => {
    const appointmentDate = parseISO(item.dateTime);
    const designDetails =
      typeof item.designDetails === 'string'
        ? JSON.parse(item.designDetails)
        : item.designDetails;

    return (
      <SwipeableRow
        onDelete={() => {
          Alert.alert(
            'İşlem Seçin',
            'Bu randevu için ne yapmak istiyorsunuz?',
            [
              { text: 'İptal', style: 'cancel' },
              {
                text: 'Tamamlandı',
                onPress: () => handleStatusChange(item.$id, 'completed'),
              },
              {
                text: 'İptal Et',
                style: 'destructive',
                onPress: () => handleStatusChange(item.$id, 'cancelled'),
              },
            ]
          );
        }}
      >
        <Pressable
          onPress={() => router.push(`/appointments/${item.$id}`)}
          className={`p-4 mb-3 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text
                className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
              >
                {format(appointmentDate, 'd MMMM yyyy - HH:mm', { locale: tr })}
              </Text>
              <Text
                className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
              >
                {designDetails.style} - {designDetails.size} -{' '}
                {designDetails.placement}
              </Text>
              <Text
                className={`text-sm font-rubik-medium text-[${theme.colors.accent.primary}] mt-1`}
              >
                {item.price} ₺
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                item.status === 'pending'
                  ? 'bg-amber-500/20'
                  : item.status === 'confirmed'
                    ? 'bg-blue-500/20'
                    : item.status === 'completed'
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
              }`}
            >
              <Text
                className={`text-sm font-rubik-medium ${
                  item.status === 'pending'
                    ? 'text-amber-500'
                    : item.status === 'confirmed'
                      ? 'text-blue-500'
                      : item.status === 'completed'
                        ? 'text-green-500'
                        : 'text-red-500'
                }`}
              >
                {item.status === 'pending'
                  ? 'Beklemede'
                  : item.status === 'confirmed'
                    ? 'Onaylandı'
                    : item.status === 'completed'
                      ? 'Tamamlandı'
                      : 'İptal Edildi'}
              </Text>
            </View>
          </View>
        </Pressable>
      </SwipeableRow>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
      style={{ paddingBottom: 70 }}
    >
      <View className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          Randevu Yönetimi
        </Text>

        {/* Arama Kutusu */}
        <View className="mb-4">
          <View
            className={`flex-row items-center px-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
          >
            <Image
              source={icons.search}
              className="w-5 h-5"
              style={{ tintColor: theme.colors.text.secondary(isDarkMode) }}
            />
            <TextInput
              value={search}
              onChangeText={(text) => setSearch(text)}
              onSubmitEditing={loadAppointments}
              placeholder="Müşteri Adı Ara..."
              className={`flex-1 p-4 text-[${theme.colors.text.primary(isDarkMode)}]`}
              placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
            />
          </View>
        </View>

        {/* Durum Filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
            (status) => (
              <Pressable
                key={status}
                onPress={() => setFilter(status)}
                className={`px-4 py-2 mr-2 rounded-full ${
                  filter === status
                    ? `bg-[${theme.colors.accent.primary}]`
                    : `bg-[${theme.colors.card.background(isDarkMode)}]`
                }`}
              >
                <Text
                  className={`font-rubik-medium ${
                    filter === status
                      ? 'text-white'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {status === 'all'
                    ? 'Tümü'
                    : status === 'pending'
                      ? 'Bekleyen'
                      : status === 'confirmed'
                        ? 'Onaylanan'
                        : status === 'completed'
                          ? 'Tamamlanan'
                          : 'İptal Edilen'}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={theme.colors.accent.primary} />
          </View>
        ) : (
          <FlashList
            data={appointments}
            renderItem={renderAppointmentItem}
            estimatedItemSize={100}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Text
                  className={`text-[${theme.colors.text.secondary(isDarkMode)}] text-center`}
                >
                  Randevu bulunamadı
                </Text>
              </View>
            }
            onRefresh={loadAppointments}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
