import { View, Text, ScrollView, Pressable, Switch, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useGlobalContext } from "@/lib/global-provider";
import { useRouter } from "expo-router";
import icons from "@/constants/icons";

export default function Profile() {
  const { user, logout } = useGlobalContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-rubik-semibold text-black-300">
            Profil
          </Text>
        </View>

        {/* Profil Bilgileri */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mt-6 px-4"
        >
          <View className="bg-white p-4 rounded-2xl">
            <Text className="text-lg font-rubik-medium text-black-300">
              {user?.name}
            </Text>
            <Text className="text-black-100 mt-1">{user?.email}</Text>
          </View>
        </Animated.View>

        {/* Ayarlar */}
        <View className="mt-6 px-4">
          <Text className="text-lg font-rubik-medium text-black-300 mb-4">
            Ayarlar
          </Text>

          <View className="bg-white rounded-2xl">
            <Pressable className="p-4 flex-row items-center justify-between border-b border-gray-100">
              <Text className="font-rubik text-black-300">Bildirimler</Text>
              <Switch />
            </Pressable>

            <Pressable className="p-4 flex-row items-center justify-between">
              <Text className="font-rubik text-black-300">Dil</Text>
              <Text className="font-rubik text-black-100">Türkçe</Text>
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-6 px-4">
          <Pressable
            onPress={handleLogout}
            className="bg-red-50 p-4 rounded-2xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center space-x-3">
              <Image
                source={icons.logout}
                className="w-6 h-6"
                style={{ tintColor: "#F75555" }}
              />
              <Text className="font-rubik text-red-500">Çıkış Yap</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
