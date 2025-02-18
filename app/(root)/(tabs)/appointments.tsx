import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import Animated, {
  FadeInDown,
  SlideInRight,
  FadeIn,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icons";

// Türkçe lokalizasyon ayarları
LocaleConfig.locales["tr"] = {
  monthNames: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  monthNamesShort: [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ],
  dayNames: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],
  dayNamesShort: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
};

LocaleConfig.defaultLocale = "tr";

export default function Appointments() {
  const { user } = useGlobalContext();
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 flex-row items-center justify-between">
          <View>
            <Animated.Text
              entering={FadeInDown.delay(100)}
              className="text-2xl font-rubik-semibold text-black-300"
            >
              Randevular
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(200)}
              className="text-black-100 font-rubik mt-1"
            >
              Uygun tarihi seçin
            </Animated.Text>
          </View>

          <Animated.View
            entering={FadeIn.delay(300)}
            className="bg-white rounded-full p-2"
          >
            <Image
              source={icons.bell}
              className="w-6 h-6"
              style={{ tintColor: "#191D31" }}
            />
          </Animated.View>
        </View>

        {/* Calendar */}
        <Animated.View entering={SlideInRight.delay(400)} className="mt-6 px-4">
          <BlurView intensity={30} className="overflow-hidden rounded-3xl">
            <Calendar
              theme={{
                calendarBackground: "transparent",
                todayTextColor: "#0061FF",
                selectedDayBackgroundColor: "#0061FF",
                selectedDayTextColor: "#ffffff",
                textDayFontFamily: "Rubik-Regular",
                textMonthFontFamily: "Rubik-Medium",
                textDayHeaderFontFamily: "Rubik-Medium",
                arrowColor: "#0061FF",
                dotColor: "#0061FF",
                selectedDotColor: "#ffffff",
                monthTextColor: "#191D31",
                dayTextColor: "#191D31",
              }}
              enableSwipeMonths
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: { selected: true },
              }}
            />
          </BlurView>
        </Animated.View>

        {/* Available Time Slots */}
        <View className="mt-8 px-4">
          <Animated.Text
            entering={FadeInDown.delay(500)}
            className="text-lg font-rubik-medium text-black-300 mb-4"
          >
            Müsait Saatler
          </Animated.Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-3"
          >
            {["10:00", "11:30", "13:00", "14:30", "16:00"].map(
              (time, index) => (
                <Animated.View
                  key={time}
                  entering={FadeInDown.delay(600 + index * 100)}
                >
                  <BlurView
                    intensity={30}
                    className="overflow-hidden rounded-2xl"
                  >
                    <Pressable className="px-6 py-3">
                      <Text className="font-rubik-medium text-black-300">
                        {time}
                      </Text>
                    </Pressable>
                  </BlurView>
                </Animated.View>
              )
            )}
          </ScrollView>
        </View>

        {/* Upcoming Appointments */}
        <View className="mt-8 px-4 pb-8">
          <Animated.Text
            entering={FadeInDown.delay(800)}
            className="text-lg font-rubik-medium text-black-300 mb-4"
          >
            Yaklaşan Randevular
          </Animated.Text>

          {/* Appointment Cards */}
          {/* Buraya randevu kartları gelecek */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
