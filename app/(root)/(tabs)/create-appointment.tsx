import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tr } from 'date-fns/locale';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { appointmentService } from '@/lib/services/appointment';
import { ID } from 'react-native-appwrite';
import { useTheme } from '@/lib/theme-provider';
import { useGlobalContext } from '@/lib/global-provider';
import { ReminderType } from '@/lib/services/appointment';
import { ReminderConfig, DEFAULT_REMINDERS } from '@/lib/services/appointment';

const TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export default function CreateAppointment() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useGlobalContext();
  const { isDarkMode, theme } = useTheme();
  const [reminderPreferences, setReminderPreferences] =
    useState<ReminderConfig[]>(DEFAULT_REMINDERS);

  // Bugünden itibaren 30 gün için randevu alınabilir
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
  const minDate = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user || !user.$id) {
      router.replace('/sign-in');
    }
  }, [user]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (selectedDate) {
      // Gerçek zamanlı müsaitlik takibi
      unsubscribe = appointmentService.subscribeToAvailability(
        selectedDate,
        (slots) => setAvailableSlots(slots)
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedDate]);

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setLoading(true);

    try {
      const slots = await appointmentService.getAvailableTimeSlots(date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Müsait saatler getirilemedi:', error);
      setAvailableSlots(TIME_SLOTS); // Fallback olarak tüm saatleri göster
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentCreate = async () => {
    if (!user?.$id) {
      console.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);

      // Randevu verilerini hazırla
      const appointmentData = {
        clientId: user.$id,
        dateTime: `${selectedDate}T${selectedTime}:00.000Z`,
        designDetails: {
          size: 'Orta',
          style: 'Traditional',
          placement: 'Kol',
        },
        status: 'pending' as const,
        notes: '', // Opsiyonel
      };

      // Randevu oluştur
      const appointment =
        await appointmentService.createWithTimezone(appointmentData);

      if (appointment) {
        // Hatırlatıcıları planla
        await appointmentService.scheduleAdvancedReminders(
          appointment.$id,
          reminderPreferences
        );

        router.push('/appointments');
      }
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Hata', 'Lütfen tarih ve saat seçin');
      return;
    }

    router.push({
      pathname: '/appointments/create-details',
      params: {
        date: selectedDate,
        time: selectedTime,
      },
    });
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      {/* Sticky Header */}
      <Animated.View
        entering={FadeInDown.delay(100)}
        className="px-4 pt-4 pb-6"
        style={{
          backgroundColor: theme.colors.background.primary(isDarkMode),
          shadowColor: theme.colors.accent.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
        >
          Randevu Oluştur
        </Text>
        <Text
          className={`font-rubik mt-2 text-base text-[${theme.colors.text.secondary(isDarkMode)}]`}
        >
          Size en uygun tarih ve saati seçin
        </Text>
      </Animated.View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Takvim Bölümü */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-4 mt-2"
        >
          <View
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: theme.colors.card.background(isDarkMode),
              shadowColor: theme.colors.accent.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <Calendar
              minDate={minDate}
              maxDate={maxDate}
              onDayPress={(day: any) => handleDateSelect(day.dateString)}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: theme.colors.accent.primary,
                },
              }}
              theme={{
                todayTextColor: theme.colors.accent.primary,
                selectedDayBackgroundColor: theme.colors.accent.primary,
                selectedDayTextColor: '#ffffff',
                textDayFontFamily: 'Rubik-Regular',
                textMonthFontFamily: 'Rubik-Medium',
                textDayHeaderFontFamily: 'Rubik-Medium',
                calendarBackground: 'transparent',
                textColor: theme.colors.text.primary(isDarkMode),
                monthTextColor: theme.colors.text.primary(isDarkMode),
                dayTextColor: theme.colors.text.primary(isDarkMode),
              }}
            />
          </View>
        </Animated.View>

        {/* Saat Seçimi */}
        {selectedDate && (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="mt-8 px-4"
          >
            <Text
              className={`text-xl font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
            >
              Müsait Saatler
            </Text>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.accent.primary}
              />
            ) : availableSlots.length > 0 ? (
              <View className="flex-row flex-wrap gap-3">
                {availableSlots.map((time, index) => (
                  <Animated.View
                    key={time}
                    entering={FadeInDown.delay(400 + index * 50).springify()}
                  >
                    <Pressable
                      onPress={() => setSelectedTime(time)}
                      className={`px-6 py-3 rounded-2xl ${
                        selectedTime === time
                          ? `bg-[${theme.colors.accent.primary}]`
                          : `bg-[${theme.colors.card.background(isDarkMode)}]`
                      }`}
                      style={{
                        shadowColor: theme.colors.accent.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: selectedTime === time ? 0.2 : 0.1,
                        shadowRadius: 4,
                      }}
                    >
                      <Text
                        className={`font-rubik-medium text-base ${
                          selectedTime === time
                            ? 'text-white'
                            : `text-[${theme.colors.text.primary(isDarkMode)}]`
                        }`}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <Animated.View
                entering={FadeInDown.delay(400)}
                className={`p-6 rounded-2xl bg-[${theme.colors.status.cancelled.background(isDarkMode)}]`}
              >
                <Text
                  className={`font-rubik-medium text-center text-base text-[${theme.colors.status.cancelled.text(isDarkMode)}]`}
                >
                  Bu tarih için müsait randevu saati bulunmamaktadır
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* Devam Et Butonu */}
        {selectedDate && selectedTime && (
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            className="mt-8 px-4 mb-8"
          >
            <Pressable
              onPress={handleContinue}
              className="py-4 rounded-2xl bg-black"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              <Text className="text-white font-rubik-medium text-center text-lg">
                Devam Et
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
