import { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInRight,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

import { useGlobalContext } from "@/lib/global-provider";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import images from "@/constants/images";
import { useTheme } from "@/lib/theme-provider";

const { width } = Dimensions.get("window");

interface User extends Record<string, any> {
  $id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "client";
}

type Appointment = {
  _id: string;
  dateTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  designDetails: {
    size: string;
    style: string;
    placement: string;
  };
  price: number;
};

type PortfolioItem = {
  _id: string;
  title: string;
  images: string[];
  style: string;
};

export default function Index() {
  const router = useRouter();
  const { user, logout } = useGlobalContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentWorks, setRecentWorks] = useState<PortfolioItem[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Randevuları getir
        const appointmentsData = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          [
            ...(user.role === "admin"
              ? [Query.orderDesc("dateTime")]
              : [
                  Query.equal("clientId", user.$id),
                  Query.orderDesc("dateTime"),
                ]),
            Query.limit(5),
          ]
        );
        setAppointments(
          appointmentsData.documents.map((doc) => ({
            _id: doc.$id,
            dateTime: doc.dateTime,
            status: doc.status,
            designDetails: doc.designDetails,
            price: doc.price,
          }))
        );

        // Son portföy çalışmalarını getir
        const portfolioData = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.portfolioCollectionId!,
          [Query.orderDesc("createdAt"), Query.limit(3)]
        );
        setRecentWorks(
          portfolioData.documents.map((doc) => ({
            _id: doc.$id,
            title: doc.title,
            images: doc.images,
            style: doc.style,
          }))
        );
      } catch (error: any) {
        if (error.code === 404) {
          console.log(
            "Koleksiyon bulunamadı, lütfen Appwrite konsolunda koleksiyonları oluşturun"
          );
        } else {
          console.error("Veri çekme hatası:", error);
        }
      }
    };

    fetchData();
  }, [user]);

  // Tema bazlı renkler güncellendi
  const theme = {
    background: isDarkMode ? "bg-[#121212]" : "bg-[#FAFAFA]",
    card: {
      background: isDarkMode ? "bg-[#1E1E1E]" : "bg-white",
      border: isDarkMode ? "border-[#2A2A2A]" : "border-gray-100",
      highlight: isDarkMode ? "bg-[#2A2A2A]" : "bg-neutral-50",
    },
    text: {
      primary: isDarkMode ? "text-[#E0E0E0]" : "text-black-300",
      secondary: isDarkMode ? "text-[#A0A0A0]" : "text-black-100",
      accent: isDarkMode ? "text-neutral-200" : "text-neutral-700",
    },
  };

  const getStatusColor = (
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    const colors = isDarkMode
      ? {
          pending: "bg-amber-500/20 text-amber-400",
          confirmed: "bg-neutral-500/20 text-neutral-300",
          completed: "bg-emerald-500/20 text-emerald-400",
          cancelled: "bg-rose-500/20 text-rose-400",
        }
      : ({
          pending: "bg-amber-100 text-amber-800",
          confirmed: "bg-neutral-100 text-neutral-800",
          completed: "bg-emerald-100 text-emerald-800",
          cancelled: "bg-rose-100 text-rose-800",
        } as const);
    return colors[status];
  };

  const handleAppointmentsPress = () => {
    router.push("/(root)/(tabs)/appointments" as any);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.background}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header - Yeniden Tasarlandı */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-6 pt-6"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`${theme.text.secondary} text-base font-rubik`}>
                {new Date().toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
              <Text
                className={`${theme.text.primary} text-2xl font-rubik-bold mt-1`}
              >
                {user?.name}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(root)/(tabs)/profile")}
              className={`${theme.card.background} p-2 rounded-full shadow-sm`}
            >
              <Image
                source={user?.avatar ? { uri: user.avatar } : images.avatar}
                className="w-10 h-10 rounded-full"
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* İstatistik Kartları - Yeni */}
        <View className="flex-row px-6 mt-8 space-x-4">
          <Animated.View
            entering={FadeInRight.delay(200).springify()}
            className="flex-1"
          >
            <Pressable
              onPress={handleAppointmentsPress}
              className={`${theme.card.background} p-4 rounded-2xl border ${theme.card.border}`}
            >
              <Text className={`${theme.text.accent} text-2xl font-rubik-bold`}>
                {appointments.length}
              </Text>
              <Text
                className={`${theme.text.secondary} text-sm font-rubik mt-1`}
              >
                Aktif Randevu
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInRight.delay(300).springify()}
            className="flex-1"
          >
            <View
              className={`${theme.card.background} p-4 rounded-2xl border ${theme.card.border}`}
            >
              <Text className={`${theme.text.accent} text-2xl font-rubik-bold`}>
                {recentWorks.length}
              </Text>
              <Text
                className={`${theme.text.secondary} text-sm font-rubik mt-1`}
              >
                Yeni Çalışma
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Randevular - Yeniden Tasarlandı */}
        <View className="mt-8 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`${theme.text.primary} text-xl font-rubik-bold`}>
              Son Randevular
            </Text>
            <Pressable onPress={handleAppointmentsPress}>
              <Text className={`${theme.text.accent} font-rubik-medium`}>
                Tümünü Gör
              </Text>
            </Pressable>
          </View>

          {appointments.map((appointment, index) => (
            <Animated.View
              key={appointment._id}
              entering={FadeInDown.delay(400 + index * 100).springify()}
              className="mb-4"
            >
              <Pressable
                className={`${theme.card.background} p-4 rounded-2xl border ${theme.card.border}`}
                onPress={() => {
                  // Randevu detayına yönlendirme
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-2 mb-2">
                      <View
                        className={`w-2 h-2 rounded-full ${
                          appointment.status === "confirmed"
                            ? "bg-neutral-400"
                            : appointment.status === "pending"
                            ? "bg-amber-400"
                            : appointment.status === "completed"
                            ? "bg-emerald-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <Text
                        className={`${theme.text.secondary} text-sm font-rubik-medium`}
                      >
                        {appointment.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      className={`${theme.text.primary} text-lg font-rubik-medium`}
                    >
                      {appointment.designDetails.style}
                    </Text>
                    <Text className={`${theme.text.secondary} text-sm mt-1`}>
                      {appointment.designDetails.size}
                    </Text>
                  </View>
                  <Text
                    className={`${theme.text.accent} text-lg font-rubik-bold`}
                  >
                    {appointment.price}₺
                  </Text>
                </View>
                <View className={`mt-3 pt-3 border-t ${theme.card.border}`}>
                  <Text className={`${theme.text.secondary} text-sm`}>
                    {new Date(appointment.dateTime).toLocaleString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Portfolyo - Yeniden Tasarlandı */}
        <View className="mt-8 px-6 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`${theme.text.primary} text-xl font-rubik-bold`}>
              Son Çalışmalar
            </Text>
            <Pressable onPress={() => router.push("/(root)/(tabs)/portfolio")}>
              <Text className={`${theme.text.accent} font-rubik-medium`}>
                Tümünü Gör
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-4"
          >
            {recentWorks.map((work, index) => (
              <Animated.View
                key={work._id}
                entering={FadeInRight.delay(500 + index * 100).springify()}
                className="w-64"
              >
                <Pressable
                  className={`${theme.card.background} rounded-2xl overflow-hidden border ${theme.card.border}`}
                >
                  <Image
                    source={{ uri: work.images[0] }}
                    className="w-full h-64 rounded-t-2xl"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text
                      className={`${theme.text.primary} text-lg font-rubik-medium`}
                    >
                      {work.title}
                    </Text>
                    <View className="flex-row items-center space-x-2 mt-1">
                      <View className="w-1.5 h-1.5 rounded-full bg-primary-300" />
                      <Text className={`${theme.text.secondary} text-sm`}>
                        {work.style}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
