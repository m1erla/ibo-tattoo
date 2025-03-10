import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { appointmentService } from '@/lib/services/appointment';
import { useGlobalContext } from '@/lib/global-provider';
import { format, parse, addMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@/lib/theme-provider';
import * as Notifications from 'expo-notifications';
import { reviewsService } from '@/lib/services/reviews';
import { ID } from 'react-native-appwrite';

const TATTOO_SIZES = ['Küçük', 'Orta', 'Büyük', 'Çok Büyük'];
const TATTOO_STYLES = ['Minimal', 'Realistik', 'Traditional', 'Tribal'];
const BODY_PARTS = ['Kol', 'Bacak', 'Sırt', 'Göğüs', 'Bilek'];

interface AppointmentDetails {
  $id: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  designDetails: {
    size: string;
    style: string;
    placement: string;
  };
  price: number;
  notes?: string;
  clientId: string;
}

export default function AppointmentDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    date?: string;
    time?: string;
    status?: string;
    isNew?: string;
  }>();
  const { id, date, time, status, isNew } = params;

  const [size, setSize] = useState('');
  const [style, setStyle] = useState('');
  const [placement, setPlacement] = useState('');
  const [notes, setNotes] = useState('');
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDateTime, setNewDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { isDarkMode, theme } = useTheme();

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id || isNew) return;

      setLoading(true);
      try {
        const response = await databases.getDocument(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          id as string
        );

        if (response) {
          setAppointment({
            $id: response.$id,
            dateTime: response.dateTime,
            status: response.status,
            designDetails: JSON.parse(response.designDetails),
            price: response.price,
            notes: response.notes,
            clientId: response.clientId,
          });
        }
      } catch (error) {
        console.error('Randevu detayları getirilemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id, isNew]);

  const handleSubmit = async () => {
    if (!size || !style || !placement) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);

      const appointmentData = {
        clientId: user?.$id!,
        dateTime: `${date}T${time}:00.000Z`,
        designDetails: {
          size,
          style,
          placement,
        },
        notes,
        status: 'pending',
      } as const;

      await appointmentService.create(appointmentData);

      Alert.alert(
        'Başarılı',
        'Randevunuz başarıyla oluşturuldu. Onay için bekleyiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => router.push('/(root)/(tabs)/appointments'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Hata',
        error.message || 'Randevu oluşturulurken bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  // Randevu İptali
  const handleCancel = async () => {
    if (!appointment) return;

    try {
      await appointmentService.cancel(appointment.$id, cancelReason);
      Alert.alert('Başarılı', 'Randevu iptal edildi');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Randevu iptal edilemedi');
    }
  };

  // Yeniden Planlama
  const handleReschedule = async () => {
    if (!appointment) return;

    try {
      await appointmentService.reschedule(
        appointment.$id,
        newDateTime.toISOString()
      );
      Alert.alert('Başarılı', 'Randevu yeniden planlandı');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Randevu yeniden planlanamadı');
    }
  };

  // Notification izni ve kayıt
  const registerForPushNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Uyarı', 'Bildirim izni verilmedi');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();

      // Token'ı veritabanına kaydet
      await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.pushTokensCollectionId!,
        ID.unique(),
        {
          userId: user!.$id,
          token: token.data,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Push notification kaydı hatası:', error);
    }
  };

  const ReviewSection = () => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const submitReview = async () => {
      try {
        if (rating === 0) {
          Alert.alert('Hata', 'Lütfen bir puan verin');
          return;
        }

        await reviewsService.create({
          userId: user!.$id,
          appointmentId: id,
          rating,
          comment,
          images,
        });

        Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi');
        router.back();
      } catch (error) {
        Alert.alert('Hata', 'Değerlendirme kaydedilirken bir hata oluştu');
      }
    };

    return (
      <View className="mt-6">
        <Text
          className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
        >
          Değerlendirme
        </Text>

        {/* Yıldız Derecelendirme */}
        <View className="flex-row justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => setRating(star)}
              className="px-2"
            >
              <Text
                className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Yorum Alanı */}
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Deneyiminizi paylaşın..."
          multiline
          numberOfLines={4}
          className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
        />

        {/* Gönder Butonu */}
        <Pressable
          onPress={submitReview}
          className={`p-4 rounded-xl bg-[${theme.colors.accent.primary}]`}
        >
          <Text className="text-white text-center font-rubik-medium">
            Değerlendirmeyi Gönder
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4">
          <Text
            className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            Randevu Detayları
          </Text>
          {appointment ? (
            <Text
              className={`font-rubik mt-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              {format(new Date(appointment.dateTime), 'd MMMM yyyy - HH:mm', {
                locale: tr,
              })}
            </Text>
          ) : (
            <Text
              className={`font-rubik mt-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              {`${date || 'Tarih yok'} - ${time || 'Saat yok'}`}
            </Text>
          )}
        </View>

        {/* Dövme Boyutu */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mt-6 px-4"
        >
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Dövme Boyutu
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
                      ? 'text-white'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Dövme Stili */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="mt-6 px-4"
        >
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Dövme Stili
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
                      ? 'text-white'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Vücut Bölgesi */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="mt-6 px-4"
        >
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Vücut Bölgesi
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
                      ? 'text-white'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Notlar */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          className="mt-6 px-4"
        >
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Ekstra Notlar
          </Text>
          <BlurView intensity={30} className="rounded-2xl overflow-hidden">
            <TextInput
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              className={`p-4 min-h-[100] text-[${theme.colors.text.primary(isDarkMode)}] font-rubik bg-[${theme.colors.card.background(isDarkMode)}]`}
              placeholder="Dövmeniz hakkında ekstra bilgiler..."
              placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
            />
          </BlurView>
        </Animated.View>

        {/* Randevu Oluştur Butonu */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          className="mt-8 px-4 pb-8"
        >
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
              <Text className="text-white font-rubik-medium text-center">
                Randevu Oluştur
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {appointment && (
          <View className="flex-row space-x-4 mt-4 px-4">
            <Pressable
              onPress={() => setShowCancelModal(true)}
              className="flex-1 bg-red-50 p-4 rounded-xl"
            >
              <Text className="text-red-500 text-center font-rubik-medium">
                İptal Et
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsRescheduling(true)}
              className="flex-1 bg-primary-50 p-4 rounded-xl"
            >
              <Text className="text-primary-500 text-center font-rubik-medium">
                Yeniden Planla
              </Text>
            </Pressable>
          </View>
        )}

        {appointment?.status === 'completed' && <ReviewSection />}
      </ScrollView>

      {/* İptal Modalı */}
      <Modal visible={showCancelModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View
            className={`rounded-2xl p-4 bg-[${theme.colors.card.background(isDarkMode)}]`}
          >
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
            >
              Randevu İptali
            </Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="İptal sebebi"
              className={`p-4 rounded-xl bg-[${theme.colors.background.secondary(isDarkMode)}]`}
              placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
            />
            <View className="flex-row space-x-4">
              <Pressable
                onPress={() => setShowCancelModal(false)}
                className="flex-1 p-4 rounded-xl bg-gray-100"
              >
                <Text className="text-center font-rubik-medium">Vazgeç</Text>
              </Pressable>
              <Pressable
                onPress={handleCancel}
                className="flex-1 p-4 rounded-xl bg-red-500"
              >
                <Text className="text-white text-center font-rubik-medium">
                  İptal Et
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Yeniden Planlama Modalı */}
      <Modal visible={isRescheduling} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-rubik-medium text-black-300 mb-4">
              Yeni Tarih Seç
            </Text>

            <Calendar
              onDayPress={(day: any) => {
                const selectedDate = parse(
                  day.dateString,
                  'yyyy-MM-dd',
                  new Date()
                );
                setNewDateTime(selectedDate);
              }}
              markedDates={{
                [format(newDateTime, 'yyyy-MM-dd')]: {
                  selected: true,
                  selectedColor: '#0061FF',
                },
              }}
              minDate={format(new Date(), 'yyyy-MM-dd')}
            />

            {/* Saat Seçimi */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const time = addMinutes(
                  new Date().setHours(9, 0, 0, 0),
                  i * 30
                );
                const timeStr = format(time, 'HH:mm');
                const isSelected = format(newDateTime, 'HH:mm') === timeStr;

                return (
                  <Pressable
                    key={timeStr}
                    onPress={() => {
                      const [hours, minutes] = timeStr.split(':').map(Number);
                      setNewDateTime((prev) => {
                        const updated = new Date(prev);
                        updated.setHours(hours, minutes);
                        return updated;
                      });
                    }}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      isSelected ? 'bg-primary-300' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`font-rubik-medium ${
                        isSelected ? 'text-white' : 'text-black-300'
                      }`}
                    >
                      {timeStr}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="flex-row space-x-4 mt-4">
              <Pressable
                onPress={() => setIsRescheduling(false)}
                className="flex-1 p-4 rounded-xl bg-gray-100"
              >
                <Text className="text-center font-rubik-medium">Vazgeç</Text>
              </Pressable>
              <Pressable
                onPress={handleReschedule}
                className="flex-1 p-4 rounded-xl bg-primary-300"
              >
                <Text className="text-white text-center font-rubik-medium">
                  Güncelle
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
