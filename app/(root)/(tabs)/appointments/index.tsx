import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Animated, {
  FadeInDown,
  SlideInRight,
  FadeIn,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import { appointmentService } from '@/lib/services/appointment';
import icons from '@/constants/icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AppointmentStatus } from '@/lib/services/appointment';
import { Query } from 'react-native-appwrite';
import { useTheme } from '@/lib/theme-provider';

// Türkçe lokalizasyon ayarları
LocaleConfig.locales['tr'] = {
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  monthNamesShort: [
    'Oca',
    'Şub',
    'Mar',
    'Nis',
    'May',
    'Haz',
    'Tem',
    'Ağu',
    'Eyl',
    'Eki',
    'Kas',
    'Ara',
  ],
  dayNames: [
    'Pazar',
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
  ],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
};

LocaleConfig.defaultLocale = 'tr';

interface Appointment {
  $id: string;
  dateTime: string;
  status: AppointmentStatus;
  designDetails: {
    size: string;
    style: string;
    placement: string;
  };
  clientId: string;
}

export default function Appointments() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const { isDarkMode, theme } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.list([
        ...(user?.role === 'admin'
          ? [] // Admin için filtre yok
          : [Query.equal('clientId', user?.$id!)]), // Client için sadece kendi randevuları
        Query.orderDesc('dateTime'),
      ]);

      setAppointments(
        response.documents.map((doc: any) => ({
          $id: doc.$id,
          dateTime: doc.dateTime,
          status: doc.status,
          designDetails: JSON.parse(doc.designDetails),
          clientId: doc.clientId,
        }))
      );
    } catch (error) {
      console.error('Randevuları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    try {
      await appointmentService.update(appointmentId, { status: newStatus });
      // Listeyi güncelle
      fetchAppointments();
    } catch (error) {
      console.error('Randevu durumu güncellenirken hata:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
      >
        <View className="flex-1 items-center justify-center">
          <Text
            className={`text-[${theme.colors.text.primary(isDarkMode)}] font-rubik`}
          >
            Yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 flex-row items-center justify-between">
          <View>
            <Animated.Text
              entering={FadeInDown.delay(100)}
              className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
            >
              Randevular
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(200)}
              className={`text-[${theme.colors.text.secondary(isDarkMode)}] font-rubik mt-1`}
            >
              Randevularınızı yönetin
            </Animated.Text>
          </View>

          <Pressable
            onPress={() => router.push('/(root)/(tabs)/create-appointment')}
            className={`p-2 rounded-full bg-[${theme.colors.accent.primary}]`}
          >
            <Image
              source={icons.plus}
              className="w-6 h-6"
              style={{ tintColor: isDarkMode ? '#FFFFFF' : '#000000' }}
            />
          </Pressable>
        </View>

        {/* Randevu Listesi */}
        <View className="mt-6 px-4 pb-8">
          <Animated.Text
            entering={FadeInDown.delay(300)}
            className={`text-xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
          >
            {user?.role === 'admin' ? 'Tüm Randevular' : 'Randevularım'}
          </Animated.Text>

          {appointments.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(400)}
              className="items-center justify-center py-8"
            >
              <Image
                source={require('@/assets/icons/calendar.png')}
                className="w-24 h-24 opacity-50 mb-4"
              />
              <Text
                className={`text-[${theme.colors.text.secondary(isDarkMode)}] font-rubik-medium text-center`}
              >
                Henüz randevu bulunmamaktadır
              </Text>
            </Animated.View>
          ) : (
            appointments.map((appointment, index) => {
              const appointmentDate = format(
                new Date(appointment.dateTime),
                'yyyy-MM-dd'
              );
              const appointmentTime = format(
                new Date(appointment.dateTime),
                'HH:mm'
              );

              return (
                <Animated.View
                  key={appointment.$id}
                  entering={FadeInDown.delay(400 + index * 100)}
                  className={`bg-[${theme.colors.card.background(isDarkMode)}] p-5 rounded-3xl mb-4`}
                  style={{
                    shadowColor: theme.colors.accent.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                  }}
                >
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: `/appointments/${appointment.$id}`,
                        params: {
                          date: appointmentDate,
                          time: appointmentTime,
                          status: appointment.status,
                        },
                      })
                    }
                    className="flex-row items-center space-x-4"
                  >
                    <View
                      className={`w-12 h-12 rounded-2xl bg-[${theme.colors.accent.primary}20] items-center justify-center`}
                    >
                      <Text
                        className={`text-[${theme.colors.accent.primary}] font-rubik-bold text-xl`}
                      >
                        {format(new Date(appointment.dateTime), 'd')}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`text-base font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
                      >
                        {format(new Date(appointment.dateTime), 'MMMM yyyy')}
                      </Text>
                      <Text
                        className={`text-sm font-rubik text-[${theme.colors.text.secondary(isDarkMode)}] mt-1`}
                      >
                        {format(new Date(appointment.dateTime), 'HH:mm')}
                      </Text>
                    </View>

                    <View
                      className={`px-4 py-2 rounded-xl bg-[${theme.colors.status[appointment.status].background(isDarkMode)}]`}
                    >
                      <Text
                        className={`text-[${theme.colors.status[appointment.status].text(isDarkMode)}] font-rubik-medium text-sm`}
                      >
                        {getStatusText(appointment.status)}
                      </Text>
                    </View>
                  </Pressable>

                  {/* Admin için onay/red butonları */}
                  {user?.role === 'admin' &&
                    appointment.status === 'pending' && (
                      <View className="flex-row gap-2 mt-3">
                        <Pressable
                          onPress={() =>
                            handleStatusChange(appointment.$id, 'confirmed')
                          }
                          className={`flex-1 py-2 rounded-xl bg-[${theme.colors.accent.primary}]`}
                        >
                          <Text className="text-white font-rubik-medium text-center text-sm">
                            Onayla
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            handleStatusChange(appointment.$id, 'cancelled')
                          }
                          className={`flex-1 py-2 rounded-xl bg-[${theme.colors.status.cancelled.background(isDarkMode)}]`}
                        >
                          <Text
                            className={`text-[${theme.colors.status.cancelled.text(isDarkMode)}] text-center font-rubik-medium text-sm`}
                          >
                            Reddet
                          </Text>
                        </Pressable>
                      </View>
                    )}
                </Animated.View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case 'pending':
      return 'Beklemede';
    case 'confirmed':
      return 'Onaylandı';
    case 'completed':
      return 'Tamamlandı';
    case 'cancelled':
      return 'İptal Edildi';
    default:
      return status;
  }
};
