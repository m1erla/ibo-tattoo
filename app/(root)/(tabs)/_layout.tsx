import { Tabs } from "expo-router";
import { Image } from "react-native";
import icons from "@/constants/icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F4F4F5",
          height: 65,
          paddingBottom: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.home}
              className="w-6 h-6"
              style={{ tintColor: focused ? "#0061FF" : "#666876" }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: "Randevular",
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.calendar}
              className="w-6 h-6"
              style={{ tintColor: focused ? "#0061FF" : "#666876" }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolyo",
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.gallery}
              className="w-6 h-6"
              style={{ tintColor: focused ? "#0061FF" : "#666876" }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.person}
              className="w-6 h-6"
              style={{ tintColor: focused ? "#0061FF" : "#666876" }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
