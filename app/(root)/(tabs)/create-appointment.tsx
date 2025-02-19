import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { tr } from "date-fns/locale";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { appointmentService } from "@/lib/services/appointment";
import { ID } from "react-native-appwrite";

const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export default function CreateAppointment() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Bugünden itibaren 30 gün için randevu alınabilir
  const maxDate = format(addDays(new Date(), 30), "yyyy-MM-dd");
  const minDate = format(new Date(), "yyyy-MM-dd");

  // Seçilen tarih değiştiğinde müsait saatleri getir
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await appointmentService.getAvailableTimeSlots(
        selectedDate
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Müsait saatler getirilemedi:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4">
          <Text className="text-2xl font-rubik-semibold text-black-300">
            Randevu Oluştur
          </Text>
          <Text className="text-black-100 font-rubik mt-1">
            Uygun tarih ve saati seçin
          </Text>
        </View>

        {/* Takvim */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mt-6 px-4"
        >
          <Calendar
            minDate={minDate}
            maxDate={maxDate}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "#0061FF" },
            }}
            theme={{
              todayTextColor: "#0061FF",
              selectedDayBackgroundColor: "#0061FF",
              selectedDayTextColor: "#ffffff",
              textDayFontFamily: "Rubik-Regular",
              textMonthFontFamily: "Rubik-Medium",
              textDayHeaderFontFamily: "Rubik-Medium",
            }}
          />
        </Animated.View>

        {/* Saat Seçimi */}
        {selectedDate && (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="mt-6 px-4"
          >
            <Text className="text-lg font-rubik-medium text-black-300 mb-4">
              Uygun Saati Seçin
            </Text>
            {loadingSlots ? (
              <ActivityIndicator color="#0061FF" />
            ) : availableSlots.length > 0 ? (
              <View className="flex-row flex-wrap gap-3">
                {availableSlots.map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-full ${
                      selectedTime === time ? "bg-primary-300" : "bg-white"
                    }`}
                  >
                    <Text
                      className={`font-rubik-medium ${
                        selectedTime === time ? "text-white" : "text-black-300"
                      }`}
                    >
                      {time}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="bg-red-50 p-4 rounded-2xl">
                <Text className="text-red-600 font-rubik text-center">
                  Bu tarih için müsait randevu saati bulunmamaktadır.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* İleri Butonu */}
        {selectedDate && selectedTime && (
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            className="mt-8 px-4 pb-8"
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: `/appointments/${ID.unique()}`,
                  params: {
                    date: selectedDate,
                    time: selectedTime,
                    isNew: "true",
                  },
                })
              }
              className="bg-primary-300 py-4 rounded-2xl"
            >
              <Text className="text-white font-rubik-medium text-center">
                Devam Et
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
