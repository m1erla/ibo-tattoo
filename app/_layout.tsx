import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Image, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import "./global.css";
import { GlobalProvider } from "@/lib/global-provider";
import { ThemeProvider } from "@/lib/theme-provider";

const { width, height } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-[#0061FF]">
        {/* Background Gradient */}
        <LinearGradient
          colors={["#0061FF", "#60EFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute w-full h-full"
        />

        {/* Logo Container */}
        <View className="flex-1 items-center justify-center">
          <View className="w-40 h-40 rounded-full items-center justify-center">
            {/* Outer Glow */}
            <View
              className="absolute w-full h-full rounded-full bg-white/30"
              style={{
                transform: [{ scale: 1.15 }],
                shadowColor: "#fff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
              }}
            />

            {/* Inner Circle */}
            <View className="w-full h-full rounded-full bg-white items-center justify-center overflow-hidden">
              <BlurView intensity={100} className="absolute w-full h-full" />
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-32 h-32"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Bottom Wave Pattern */}
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.1)"]}
          className="absolute bottom-0 w-full h-40"
          style={{
            transform: [{ rotate: "-3deg" }],
          }}
        />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GlobalProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </GlobalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
