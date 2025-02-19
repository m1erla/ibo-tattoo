import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provider";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { account } from "@/lib/appwrite";

export default function AppLayout() {
  const { loading, isLogged } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.getSession("current");
      } catch (error) {
        router.replace("/sign-in");
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="bg-white h-full flex justify-center items-center">
        <ActivityIndicator color="#0061FF" size="large" />
      </SafeAreaView>
    );
  }

  if (!isLogged) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
