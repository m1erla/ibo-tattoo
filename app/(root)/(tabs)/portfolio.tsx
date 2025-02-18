import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useGlobalContext } from "@/lib/global-provider";

export default function Portfolio() {
  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-rubik-semibold text-black-300">
            Portfolyo
          </Text>
        </View>

        {/* Filtreler */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 px-4"
        >
          <Pressable className="bg-primary-300 px-4 py-2 rounded-full mr-2">
            <Text className="text-white font-rubik-medium">Tümü</Text>
          </Pressable>
          <Pressable className="bg-white px-4 py-2 rounded-full mr-2">
            <Text className="text-black-300 font-rubik-medium">Minimal</Text>
          </Pressable>
          <Pressable className="bg-white px-4 py-2 rounded-full mr-2">
            <Text className="text-black-300 font-rubik-medium">Realistik</Text>
          </Pressable>
          {/* Diğer stiller */}
        </ScrollView>

        {/* Portfolyo Grid */}
        <View className="mt-6 px-4 flex-row flex-wrap justify-between">
          {/* Portfolyo öğeleri buraya gelecek */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
