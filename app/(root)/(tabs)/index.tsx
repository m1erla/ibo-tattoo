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
import { databases, config } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import images from "@/constants/images";

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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Randevuları getir
        const appointmentsData = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          config.appointmentsCollectionId!,
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
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          config.portfolioCollectionId!,
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

  const getStatusColor = (
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    } as const;
    return colors[status] || "bg-gray-100 text-gray-800";
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
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-4 pt-4">
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="flex-row items-center justify-between"
          >
            <View>
              <Text className="text-black-100 text-base font-rubik">
                Hoş geldin,
              </Text>
              <Text className="text-black-300 text-xl font-rubik-semibold mt-1">
                {user?.name}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(root)/(tabs)/profile")}
              className="overflow-hidden rounded-full"
            >
              <Image
                source={
                  user?.avatar && user.avatar !== "null"
                    ? { uri: user.avatar }
                    : images.avatar
                }
                className="w-12 h-12 rounded-full bg-gray-100"
                defaultSource={images.avatar}
                onError={() => {
                  console.log("Avatar yükleme hatası");
                }}
              />
            </Pressable>
          </Animated.View>
        </View>

        {/* Stats Card */}
        <Animated.View
          entering={FadeInRight.delay(200).springify()}
          className="mx-4 mt-6"
        >
          <BlurView intensity={30} className="rounded-3xl overflow-hidden">
            <Pressable
              onPress={handleAppointmentsPress}
              className="p-4 bg-primary-300/10"
            >
              <Image
                source={images.cardGradient}
                className="absolute w-full h-full"
                resizeMode="cover"
              />
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-black-300 text-lg font-rubik-medium">
                    {user?.role === "admin"
                      ? "Günlük Randevular"
                      : "Randevularım"}
                  </Text>
                  <Text className="text-black-100 text-sm font-rubik mt-1">
                    {appointments.length} aktif randevu
                  </Text>
                </View>
              </View>
            </Pressable>
          </BlurView>
        </Animated.View>

        {/* Recent Appointments */}
        <View className="mt-8 px-4">
          <Animated.Text
            entering={SlideInRight.delay(300).springify()}
            className="text-black-300 text-lg font-rubik-medium mb-4"
          >
            Son Randevular
          </Animated.Text>

          {appointments.map((appointment, index) => (
            <Animated.View
              key={appointment._id}
              entering={FadeInDown.delay(400 + index * 100).springify()}
              className="bg-white p-4 rounded-2xl mb-3 shadow-sm"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <View
                      className={`px-2 py-1 rounded-full ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      <Text className="text-xs font-rubik-medium">
                        {appointment.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-black-300 font-rubik-medium mt-2">
                    {appointment.designDetails.style} -{" "}
                    {appointment.designDetails.size}
                  </Text>
                  <Text className="text-black-100 text-sm font-rubik mt-1">
                    {new Date(appointment.dateTime).toLocaleString("tr-TR")}
                  </Text>
                </View>
                <Text className="text-primary-300 font-rubik-medium">
                  {appointment.price}₺
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Recent Portfolio Works */}
        <View className="mt-8 px-4 pb-8">
          <Animated.Text
            entering={SlideInRight.delay(300).springify()}
            className="text-black-300 text-lg font-rubik-medium mb-4"
          >
            Son Çalışmalar
          </Animated.Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-4"
          >
            {recentWorks.map((work, index) => (
              <Animated.View
                key={work._id}
                entering={FadeInRight.delay(500 + index * 100).springify()}
                className="w-48 rounded-2xl overflow-hidden"
              >
                <Image
                  source={{ uri: work.images[0] }}
                  className="w-full h-48 rounded-2xl"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 p-3 bg-black/50">
                  <Text className="text-white font-rubik-medium">
                    {work.title}
                  </Text>
                  <Text className="text-white/80 text-xs font-rubik">
                    {work.style}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
