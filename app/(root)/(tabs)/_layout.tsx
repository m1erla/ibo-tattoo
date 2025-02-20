import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { useTheme } from '@/lib/theme-provider';

const AnimatedImage = Animated.createAnimatedComponent(Image);

function TabIcon({
  source,
  focused,
  color,
}: {
  source: any;
  focused: any;
  color: any;
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
    <AnimatedImage
      source={source}
      style={[
        {
          width: 24,
          height: 24,
          tintColor: color,
        },
        animatedStyle,
      ]}
      resizeMode="contain"
    />
  );
}

export default function TabLayout() {
  const { user } = useGlobalContext();
  const { isDarkMode, theme } = useTheme();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary(isDarkMode),
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 70,
          paddingBottom: 10,
          borderRadius: 20,
          marginHorizontal: 20,
          marginBottom: 20,
          position: 'absolute',
          bottom: 0,
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: isDarkMode ? '#666666' : '#666666',
        tabBarLabelStyle: {
          fontFamily: 'Rubik-Medium',
          fontSize: 12,
          color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarIcon: ({ focused, color }) => (
          <Animated.View
            style={[
              {
                padding: 8,
                borderRadius: 12,
                backgroundColor: focused
                  ? theme.colors.accent.primary + '20'
                  : 'transparent',
              },
            ]}
          >
            <TabIcon source={icons.home} focused={focused} color={color} />
          </Animated.View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.home}
              focused={focused}
              color={focused ? '#FF3366' : isDarkMode ? '#666666' : '#999999'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Randevular',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon source={icons.calendar} focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolyo',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              source={require('@/assets/icons/gallery.png')}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon source={icons.person} focused={focused} color={color} />
          ),
        }}
      />

      {/* Admin sekmesi - sadece admin rolü için görünür */}
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? '/admin/dashboard' : null, // Admin değilse sekme gizlenir
          title: 'Admin',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.dashboard}
              focused={focused}
              color={focused ? '#FF3366' : isDarkMode ? '#666666' : '#999999'}
            />
          ),
        }}
      />

      {/* Randevu oluşturma sekmesini gizle */}
      <Tabs.Screen
        name="create-appointment"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
