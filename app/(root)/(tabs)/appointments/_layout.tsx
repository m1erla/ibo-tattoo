import { Stack } from 'expo-router';
import { useTheme } from '@/lib/theme-provider';

export default function AppointmentsLayout() {
  const { isDarkMode, theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background.primary(isDarkMode),
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Randevular',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Randevu Detayı',
        }}
      />
    </Stack>
  );
}
