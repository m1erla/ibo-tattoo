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
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0061FF",
        tabBarInactiveTintColor: "#666876",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={icons.home}
              className="w-6 h-6"
              style={{ tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: "Randevular",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={icons.calendar}
              className="w-6 h-6"
              style={{ tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolyo",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={icons.gallery}
              className="w-6 h-6"
              style={{ tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={icons.person}
              className="w-6 h-6"
              style={{ tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create-appointment"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
