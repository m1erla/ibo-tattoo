import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import icons from '@/constants/icons';

interface AdminCardProps {
  title: string;
  icon: any;
  onPress: () => void;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, icon, onPress }) => {
  const { isDarkMode, theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-4 mb-4 rounded-2xl bg-[${theme.colors.card.background(isDarkMode)}]`}
    >
      <Image
        source={icon}
        style={{
          width: 24,
          height: 24,
          tintColor: theme.colors.text.primary(isDarkMode),
        }}
      />
      <Text
        className={`ml-3 text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default function AdminDashboard() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const adminMenuItems = [
    {
      title: 'Portfolyo Yönetimi',
      icon: icons.gallery,
      route: '/admin/portfolio-management',
    },
    {
      title: 'Randevu Yönetimi',
      icon: icons.calendar,
      route: '/admin/appointments-management',
    },
    {
      title: 'Müşteri Yönetimi',
      icon: icons.person,
      route: '/admin/client-management',
    },
    {
      title: 'Analitikler',
      icon: icons.info,
      route: '/admin/analytics',
    },
    {
      title: 'Ödemeler',
      icon: icons.payment,
      route: '/admin/payments',
    },
    {
      title: 'Ayarlar',
      icon: icons.settings,
      route: '/admin/settings',
    },
  ];

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          Admin Panel
        </Text>

        {/* Yönetim Kartları */}
        <View className="mb-6">
          {adminMenuItems.map((item, index) => (
            <AdminCard
              key={index}
              title={item.title}
              icon={item.icon}
              onPress={() => router.push(item.route as any)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
