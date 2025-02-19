import { Stack } from "expo-router";

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Randevular",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Randevu Detayı",
        }}
      />
    </Stack>
  );
}
