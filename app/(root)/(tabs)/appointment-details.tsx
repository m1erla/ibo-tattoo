import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { appointmentService } from "@/lib/services/appointment";
import { useGlobalContext } from "@/lib/global-provider";

const TATTOO_SIZES = ["Küçük", "Orta", "Büyük", "Çok Büyük"];
const TATTOO_STYLES = ["Minimal", "Realistik", "Traditional", "Tribal"];
const BODY_PARTS = ["Kol", "Bacak", "Sırt", "Göğüs", "Bilek"];

export default function AppointmentDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { date, time } = params;

  const [size, setSize] = useState("");
  const [style, setStyle] = useState("");
  const [placement, setPlacement] = useState("");
  const [notes, setNotes] = useState("");
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!size || !style || !placement) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
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
        status: "pending",
      } as const;

      await appointmentService.create(appointmentData);

      Alert.alert(
        "Başarılı",
        "Randevunuz başarıyla oluşturuldu. Onay için bekleyiniz.",
        [
          {
            text: "Tamam",
            onPress: () => router.push("/(root)/(tabs)/appointments"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Hata",
        error.message || "Randevu oluşturulurken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4">
          <Text className="text-2xl font-rubik-semibold text-black-300">
            Randevu Detayları
          </Text>
          <Text className="text-black-100 font-rubik mt-1">
            {`${date} - ${time}`}
          </Text>
        </View>

        {/* Dövme Boyutu */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mt-6 px-4"
        >
          <Text className="text-lg font-rubik-medium text-black-300 mb-4">
            Dövme Boyutu
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {TATTOO_SIZES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setSize(item)}
                className={`px-4 py-2 rounded-full ${
                  size === item ? "bg-primary-300" : "bg-white"
                }`}
              >
                <Text
                  className={`font-rubik-medium ${
                    size === item ? "text-white" : "text-black-300"
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
          <Text className="text-lg font-rubik-medium text-black-300 mb-4">
            Dövme Stili
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {TATTOO_STYLES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setStyle(item)}
                className={`px-4 py-2 rounded-full ${
                  style === item ? "bg-primary-300" : "bg-white"
                }`}
              >
                <Text
                  className={`font-rubik-medium ${
                    style === item ? "text-white" : "text-black-300"
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
          <Text className="text-lg font-rubik-medium text-black-300 mb-4">
            Vücut Bölgesi
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {BODY_PARTS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setPlacement(item)}
                className={`px-4 py-2 rounded-full ${
                  placement === item ? "bg-primary-300" : "bg-white"
                }`}
              >
                <Text
                  className={`font-rubik-medium ${
                    placement === item ? "text-white" : "text-black-300"
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
          <Text className="text-lg font-rubik-medium text-black-300 mb-4">
            Ekstra Notlar
          </Text>
          <BlurView intensity={30} className="rounded-2xl overflow-hidden">
            <TextInput
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              className="p-4 min-h-[100] text-black-300 font-rubik bg-primary-300/10"
              placeholder="Dövmeniz hakkında ekstra bilgiler..."
              placeholderTextColor="#8C8E98"
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
              loading ? "bg-primary-300/50" : "bg-primary-300"
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
      </ScrollView>
    </SafeAreaView>
  );
}
