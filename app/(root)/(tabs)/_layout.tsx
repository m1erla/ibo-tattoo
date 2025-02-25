import { Tabs, Stack } from 'expo-router';
import { Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme-provider';
import { useGlobalContext } from '@/lib/global-provider';
import icons from '@/constants/icons';

export default function TabsLayout() {
  const { isDarkMode, theme } = useTheme();
  const { user } = useGlobalContext();

  // Kullanıcı rolü kontrolü
  const isAdmin = user?.role === 'admin';

  // Admin olmayan kullanıcılar için gizli yolların listesi
  const hiddenRoutesForClients = [
    'admin',
    'admin/index',
    'admin/dashboard',
    'admin/appointments-management',
    'admin/portfolio-management',
    'admin/payments',
    'admin/settings',
    'portfolio/[id]',
    'portfolio/[id]/index',
  ];

  // Admin kullanıcılar için gizli yolların listesi
  const hiddenRoutesForAdmin = ['portfolio', 'appointments'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary(isDarkMode),
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary(isDarkMode),
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.primary(isDarkMode),
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      }}
    >
      {/* Ana Sayfa - Herkes için görünür */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.home} focused={focused} color={color} />
          ),
        }}
      />

      {/* Portfolyo - Sadece müşteriler için */}
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolyo',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.gallery} focused={focused} color={color} />
          ),
          href: isAdmin ? null : undefined,
          tabBarStyle: isAdmin ? { display: 'none' } : undefined,
        }}
      />

      {/* Randevular - Sadece müşteriler için */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Randevular',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.calendar} focused={focused} color={color} />
          ),
          href: isAdmin ? null : undefined,
          tabBarStyle: isAdmin ? { display: 'none' } : undefined,
        }}
      />

      {/* Admin Panel - Sadece adminler için */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.settings} focused={focused} color={color} />
          ),
          href: isAdmin ? undefined : null,
          tabBarStyle: !isAdmin ? { display: 'none' } : undefined,
        }}
      />

      {/* Profil - Herkes için görünür */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.person} focused={focused} color={color} />
          ),
        }}
      />

      {/* Görünmeyen rotaları gizle */}
      <Tabs.Screen name="create-appointment" options={{ href: null }} />

      {/* Alt sayfaların ve dinamik rotaların tab bar'da görünmesini engelle */}
      <Tabs.Screen name="portfolio/[id]" options={{ href: null }} />
      <Tabs.Screen name="portfolio/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="appointments/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="appointments/create-details"
        options={{ href: null }}
      />
    </Tabs>
  );
}

// TabIcon bileşeni
function TabIcon({
  icon,
  focused,
  color,
}: {
  icon: any;
  focused: boolean;
  color: string;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.2 : 1, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
      opacity: withTiming(focused ? 1 : 0.7, {
        duration: 200,
      }),
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Image
        source={icon}
        style={{
          width: 24,
          height: 24,
          tintColor: color,
        }}
      />
    </Animated.View>
  );
}
