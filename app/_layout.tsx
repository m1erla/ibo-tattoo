import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Image, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { FadeIn } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { ThemeProvider } from '@/lib/theme-provider';

import './global.css';
import { GlobalProvider } from '@/lib/global-provider';

const { width, height } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Rubik-Bold': require('../assets/fonts/Rubik-Bold.ttf'),
    'Rubik-ExtraBold': require('../assets/fonts/Rubik-ExtraBold.ttf'),
    'Rubik-Light': require('../assets/fonts/Rubik-Light.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik-Medium.ttf'),
    'Rubik-Regular': require('../assets/fonts/Rubik-Regular.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={['#0061FF', '#60EFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute w-full h-full"
        />
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="flex-1 items-center justify-center"
        >
          <View className="w-40 h-40 rounded-full items-center justify-center">
            <BlurView
              intensity={50}
              className="absolute w-full h-full rounded-full"
            />
            <Image
              source={require('@/assets/images/logo.png')}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>
          <ActivityIndicator color="#fff" className="mt-8" />
        </Animated.View>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GlobalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: {
                backgroundColor: '#FAFAFA',
              },
            }}
          />
        </GlobalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
