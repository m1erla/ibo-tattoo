import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import Animated, {
  FadeInDown,
  SlideInRight,
  FadeIn,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import { appointmentService } from "@/lib/services/appointment";
import icons from "@/constants/icons";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { AppointmentStatus } from "@/lib/services/appointment";
import { Query } from "react-native-appwrite";

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

interface Appointment {
  $id: string;
  dateTime: string;
  status: AppointmentStatus;
  designDetails: {
    size: string;
    style: string;
  };
  clientId: string;
}

export default function Appointments() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    if (!user?.$id) return;

    try {
      const response = await appointmentService.list([
        ...(user.role === "admin"
          ? [] // Admin için filtre yok
          : [Query.equal("clientId", user.$id)]), // Client için sadece kendi randevuları
        Query.orderDesc("dateTime"),
      ]);

      setAppointments(
        response.documents.map((doc: any) => ({
          $id: doc.$id,
          dateTime: doc.dateTime,
          status: doc.status,
          designDetails: JSON.parse(doc.designDetails),
          clientId: doc.clientId, // Admin için müşteri bilgisini de ekleyelim
        }))
      );
    } catch (error) {
      console.error("Randevuları getirme hatası:", error);
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
      console.error("Randevu durumu güncellenirken hata:", error);
    }
  };

  const renderAppointmentActions = (appointment: Appointment) => {
    if (user?.role !== "admin") return null;
    if (appointment.status !== "pending") return null;

    return (
      <View className="flex-row gap-2 mt-3">
        <Pressable
          onPress={() => handleStatusChange(appointment.$id, "confirmed")}
          className="flex-1 bg-primary-300 py-2 rounded-xl"
        >
          <Text className="text-white font-rubik-medium text-center text-sm">
            Onayla
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleStatusChange(appointment.$id, "cancelled")}
          className="flex-1 bg-red-500 py-2 rounded-xl"
        >
          <Text className="text-white font-rubik-medium text-center text-sm">
            Reddet
          </Text>
        </Pressable>
      </View>
    );
  };

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
              Randevularınızı yönetin
            </Animated.Text>
          </View>

          <Pressable
            onPress={() => router.push("/(root)/(tabs)/create-appointment")}
            className="bg-primary-300 p-2 rounded-full"
          >
            <Image
              source={icons.plus}
              className="w-6 h-6"
              style={{ tintColor: "#ffffff" }}
            />
          </Pressable>
        </View>

        {/* Randevu Listesi */}
        <View className="mt-8 px-4 pb-8">
          <Animated.Text
            entering={FadeInDown.delay(300)}
            className="text-lg font-rubik-medium text-black-300 mb-4"
          >
            {user?.role === "admin" ? "Tüm Randevular" : "Randevularım"}
          </Animated.Text>

          {appointments.map((appointment) => (
            <Animated.View
              key={appointment.$id}
              entering={FadeInDown.delay(400)}
              className="bg-white p-4 rounded-2xl mb-3"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-black-300 font-rubik-medium">
                    {format(
                      new Date(appointment.dateTime),
                      "d MMMM yyyy - HH:mm",
                      {
                        locale: tr,
                      }
                    )}
                  </Text>
                  <Text className="text-black-100 text-sm font-rubik mt-1">
                    {`${appointment.designDetails.style} - ${appointment.designDetails.size}`}
                  </Text>
                  {/* Admin için müşteri bilgisi */}
                  {user?.role === "admin" && (
                    <Text className="text-primary-300 text-sm font-rubik mt-1">
                      Müşteri ID: {appointment.clientId}
                    </Text>
                  )}
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  <Text className="text-sm font-rubik-medium">
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </View>
              {/* Onay/Red butonları */}
              {user?.role === "admin" && appointment.status === "pending" && (
                <View className="flex-row gap-2 mt-3">
                  <Pressable
                    onPress={() =>
                      handleStatusChange(appointment.$id, "confirmed")
                    }
                    className="flex-1 bg-primary-300 py-2 rounded-xl"
                  >
                    <Text className="text-white font-rubik-medium text-center text-sm">
                      Onayla
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      handleStatusChange(appointment.$id, "cancelled")
                    }
                    className="flex-1 bg-red-500 py-2 rounded-xl"
                  >
                    <Text className="text-white font-rubik-medium text-center text-sm">
                      Reddet
                    </Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case "pending":
      return "Beklemede";
    case "confirmed":
      return "Onaylandı";
    case "completed":
      return "Tamamlandı";
    case "cancelled":
      return "İptal Edildi";
    default:
      return status;
  }
};
