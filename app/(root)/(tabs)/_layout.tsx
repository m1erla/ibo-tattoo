import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
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
    />
  );
}

export default function TabLayout() {
  const { user } = useGlobalContext();
  const { isDarkMode, theme } = useTheme();
  const isAdmin = user?.role === 'admin';

  const clientTabs = [
    {
      name: 'index',
      title: 'Ana Sayfa',
      icon: icons.home,
    },
    {
      name: 'portfolio',
      title: 'Portfolyo',
      icon: icons.gallery,
    },
    {
      name: 'appointments',
      title: 'Randevular',
      icon: icons.calendar,
    },
    {
      name: 'profile',
      title: 'Profil',
      icon: icons.person,
    },
  ];

  const adminTabs = [
    {
      name: 'index',
      title: 'Ana Sayfa',
      icon: icons.home,
    },
    {
      name: 'profile',
      title: 'Profil',
      icon: icons.person,
    },
    {
      name: 'admin',
      title: 'Yönetim',
      icon: icons.settings,
    },
  ];

  const tabs = isAdmin ? adminTabs : clientTabs;

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
        tabBarActiveTintColor: '#FF3366',
        tabBarInactiveTintColor: isDarkMode ? '#666666' : '#999999',
        tabBarLabelStyle: {
          fontFamily: 'Rubik-Medium',
          fontSize: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                source={tab.icon}
                focused={focused}
                color={focused ? '#FF3366' : isDarkMode ? '#666666' : '#999999'}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
