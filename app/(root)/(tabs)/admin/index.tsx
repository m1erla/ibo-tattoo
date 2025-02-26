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
import { useLanguage } from '@/lib/services/language';
import { analyticsService, DashboardStats } from '@/lib/services/analytics';

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

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const { isDarkMode, theme } = useTheme();

  return (
    <View className="w-1/2 p-2">
      <View
        className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
      >
        <View className="flex-row items-center mb-2">
          <Image
            source={icon}
            style={{ width: 20, height: 20, tintColor: color }}
          />
          <Text
            className={`ml-2 text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
          >
            {title}
          </Text>
        </View>
        <Text className={`text-xl font-rubik-bold`} style={{ color }}>
          {value}
        </Text>
      </View>
    </View>
  );
};

export default function AdminDashboard() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );

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

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const stats = await analyticsService.getDashboardStats();
        setDashboardStats(stats as DashboardStats);
      } catch (error) {
        console.error('Dashboard istatistik yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

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

        {!loading && dashboardStats && (
          <View className="flex-row flex-wrap mb-6">
            <StatCard
              title={t('admin.totalAppointments')}
              value={dashboardStats.totalAppointments}
              icon={icons.calendar}
              color={theme.colors.accent.primary}
            />
            <StatCard
              title={t('admin.monthlyRevenue')}
              value={`${dashboardStats.monthlyRevenue.toLocaleString('tr-TR')} ₺`}
              icon={icons.payment}
              color="#4CAF50"
            />
            <StatCard
              title={t('admin.activeClients')}
              value={dashboardStats.activeClients}
              icon={icons.person}
              color="#2196F3"
            />
            <StatCard
              title={t('admin.pendingAppointments')}
              value={dashboardStats.pendingAppointments}
              icon={icons.calendar}
              color="#FF9800"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
