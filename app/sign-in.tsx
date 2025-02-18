import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, TouchableOpacity, View, Dimensions } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  BounceIn,
  SlideInDown,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { login } from "@/lib/appwrite";
import { Redirect } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icons";
import images from "@/constants/images";

const { width, height } = Dimensions.get("window");

const Auth = () => {
  const { refetch, loading, isLogged, setLoading } = useGlobalContext();

  if (!loading && isLogged) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  const handleLogin = async () => {
    try {
      setLoading(true);
      const result = await login();
      if (result) {
        await refetch();
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background Image */}
      <Image
        source={images.tattooArt}
        className="absolute w-full h-full"
        style={{ opacity: 0.5 }}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        className="absolute w-full h-full"
      />

      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-between px-6">
          {/* Header Section */}
          <Animated.View
            entering={SlideInDown.delay(200).springify()}
            className="items-center mt-10"
          >
            <View className="w-32 h-32 rounded-full items-center justify-center">
              {/* Outer Shadow */}
              <View
                className="absolute w-full h-full rounded-full bg-white/20 shadow-lg shadow-black/50"
                style={{ transform: [{ scale: 1.05 }] }}
              />

              {/* Inner Container */}
              <View className="w-[88%] h-[88%] rounded-full bg-white/10 items-center justify-center overflow-hidden">
                <BlurView intensity={20} className="absolute w-full h-full" />

                {/* Logo */}
                <Image
                  source={require("@/assets/images/logo.png")}
                  className="w-28 h-28"
                  resizeMode="contain"
                />
              </View>
            </View>
          </Animated.View>

          {/* Content Section */}
          <View className="mb-10 space-y-8">
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              className="space-y-4"
            >
              <Text className="text-4xl font-rubik-semibold text-white text-center">
                İbo Tattoo
              </Text>
              <Text className="text-lg font-rubik text-gray-300 text-center">
                Sanatsal dövme deneyimi için
              </Text>
            </Animated.View>

            {/* Login Button */}
            <Animated.View entering={FadeInUp.delay(600)} className="space-y-4">
              <BlurView intensity={20} className="overflow-hidden rounded-2xl">
                <TouchableOpacity onPress={handleLogin} className="py-4 px-6">
                  <View className="flex-row items-center justify-center space-x-3">
                    <Image
                      source={icons.google}
                      className="w-5 h-5"
                      style={{ tintColor: "#fff" }}
                      resizeMode="contain"
                    />
                    <Text className="text-base font-rubik-medium text-white">
                      Google ile Devam Et
                    </Text>
                  </View>
                </TouchableOpacity>
              </BlurView>

              <Text className="text-sm text-gray-400 text-center font-rubik">
                Giriş yaparak, şartlar ve koşulları kabul etmiş olursunuz
              </Text>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Auth;
