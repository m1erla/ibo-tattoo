import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { login } from "@/lib/appwrite";
import { Redirect } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icons";

const Auth = () => {
  const { refetch, loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleLogin = async () => {
    const result = await login();
    if (result) {
      refetch();
    } else {
      Alert.alert("Error", "Failed to login");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full flex justify-center items-center">
      <View className="w-full px-4">
        <Image
          source={require("@/assets/images/logo.png")}
          className="w-24 h-24"
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"
        >
          <View className="flex flex-row items-center justify-center">
            <Image
              source={icons.google}
              className="w-5 h-5"
              resizeMode="contain"
            />
            <Text className="text-lg font-rubik-medium text-black-300 ml-2">
              Continue with Google
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Auth;
