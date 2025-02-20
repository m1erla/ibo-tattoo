import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { useTheme } from '@/lib/theme-provider';

export default function TabLayout() {
  const { user } = useGlobalContext();
  const { isDarkMode, theme } = useTheme();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar.background(isDarkMode),
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 65,
          paddingBottom: 10,
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.tabBar.active,
        tabBarInactiveTintColor: theme.colors.tabBar.inactive(isDarkMode),
        tabBarLabelStyle: {
          fontFamily: 'Rubik-Medium',
          fontSize: 12,
          color: theme.colors.text.primary(isDarkMode),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={icons.home}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      {/* Admin için dashboard tab'i */}
      {isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin Panel',
            tabBarIcon: ({ focused, color, size }) => (
              <Image
                source={icons.dashboard}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Randevular',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={icons.calendar}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolyo',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={icons.gallery}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={icons.person}
              style={{ width: 24, height: 24, tintColor: color }}
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
