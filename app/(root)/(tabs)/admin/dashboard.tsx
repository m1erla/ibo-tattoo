import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyticsService } from '@/lib/services/analytics';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '@/lib/theme-provider';
import { SatisfactionMeter } from '@/components/SatisfactionMeter';
import { useRouter } from 'expo-router';
import icons from '@/constants/icons';
import { databases } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { appwriteConfig } from '@/lib/appwrite';

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
      className={`flex-row items-center p-4 mb-4 rounded-2xl bg-[${theme.colors.card.background(isDarkMode)}] border-[1px] border-[${theme.colors.border.primary(isDarkMode)}]`}
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

// İstatistik veri türleri
interface DashboardStats {
  dailyAppointments: number;
  dailyRevenue: number;
  monthlyAppointments: number;
  monthlyRevenue: number;
  pendingAppointments: number;
  clientCount: number;
  portfolioCount: number;
  averageRating: number;
}

export default function Dashboard() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [demographics, setDemographics] = useState({});
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    dailyAppointments: {
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0, 0],
        },
      ],
    },
    popularStyles: {
      labels: ['Minimal', 'Realistik', 'Traditional', 'Tribal'],
      datasets: [
        {
          data: [0, 0, 0, 0],
        },
      ],
    },
    customerSatisfaction: 0,
  });

  // İstatistik verileri için durum değişkenleri
  const [stats, setStats] = useState<DashboardStats>({
    dailyAppointments: 0,
    dailyRevenue: 0,
    monthlyAppointments: 0,
    monthlyRevenue: 0,
    pendingAppointments: 0,
    clientCount: 0,
    portfolioCount: 0,
    averageRating: 0,
  });

  // Randevu dağılımı verileri
  const [appointmentDistribution, setAppointmentDistribution] = useState({
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
      },
    ],
  });

  // Popüler stiller verileri
  const [popularStyles, setPopularStyles] = useState({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });

  const { width } = Dimensions.get('window');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Günlük istatistikler
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Günlük randevuları al
        const dailyAppointmentsResponse = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          [
            Query.greaterThanEqual('dateTime', today.toISOString()),
            Query.lessThan(
              'dateTime',
              new Date(today.getTime() + 86400000).toISOString()
            ),
          ]
        );

        // Aylık istatistikler
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

        // Aylık randevuları al
        const monthlyAppointmentsResponse = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          [
            Query.greaterThanEqual('dateTime', monthStart.toISOString()),
            Query.lessThanEqual('dateTime', monthEnd.toISOString()),
          ]
        );

        // Bekleyen randevular
        const pendingAppointmentsResponse = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          [Query.equal('status', 'pending')]
        );

        // Müşteri sayısı
        const clientsResponse = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.userCollectionId!,
          [Query.equal('role', 'client')]
        );

        // Portfolyo sayısı
        const portfolioResponse = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.portfolioCollectionId!
        );

        // Ortalama değerlendirme
        const reviewsResponse = await databases.listDocuments(
          appwriteConfig.databaseId!,
          'reviews'
        );

        // İstatistikleri hesapla
        const dailyRevenue = dailyAppointmentsResponse.documents.reduce(
          (sum, app) => sum + (app.price || 0),
          0
        );

        const monthlyRevenue = monthlyAppointmentsResponse.documents.reduce(
          (sum, app) => sum + (app.price || 0),
          0
        );

        const averageRating =
          reviewsResponse.documents.length > 0
            ? reviewsResponse.documents.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / reviewsResponse.documents.length
            : 0;

        // İstatistikleri güncelle
        setStats({
          dailyAppointments: dailyAppointmentsResponse.documents.length,
          dailyRevenue,
          monthlyAppointments: monthlyAppointmentsResponse.documents.length,
          monthlyRevenue,
          pendingAppointments: pendingAppointmentsResponse.documents.length,
          clientCount: clientsResponse.documents.length,
          portfolioCount: portfolioResponse.documents.length,
          averageRating,
        });

        // Son 6 ayın randevu verilerini getir
        const last6MonthsData =
          await analyticsService.getLast6MonthsAppointments();
        setAppointmentDistribution({
          labels: last6MonthsData.labels,
          datasets: [{ data: last6MonthsData.data }],
        });

        // Popüler stilleri getir
        const styleData = await analyticsService.getPopularStyles();
        setPopularStyles({
          labels: styleData.map((item) => item.style) as never[],
          datasets: [{ data: styleData.map((item) => item.count) as never[] }],
        });
      } catch (error) {
        console.error('Dashboard veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    try {
      const numValue = Number(String(value).replace(/[^0-9.-]+/g, ''));
      if (isNaN(numValue)) return '0 ₺';

      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
      }).format(numValue);
    } catch (error) {
      console.error('Para formatı hatası:', error);
      return '0 ₺';
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={isDarkMode ? '#E0E0E0' : '#191D31'} />
          <Text
            className={`text-2xl font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}] mt-4`}
          >
            Yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartData = Object.entries(demographics).map(([key, value]) => ({
    name: key,
    population: Number(value),
    color: `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`,
    legendFontColor: isDarkMode ? '#E0E0E0' : '#191D31',
    legendFontSize: 12,
  }));

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

        {/* İstatistik Kartları */}
        <View className="flex-row flex-wrap mb-4">
          <StatCard
            title="Bugünkü Randevular"
            value={stats.dailyAppointments}
            icon={icons.calendar}
            color={theme.colors.accent.primary}
          />
          <StatCard
            title="Günlük Gelir"
            value={formatCurrency(stats.dailyRevenue)}
            icon={icons.payment}
            color="#4CD964"
          />
          <StatCard
            title="Aylık Randevular"
            value={stats.monthlyAppointments}
            icon={icons.calendar}
            color="#007AFF"
          />
          <StatCard
            title="Aylık Gelir"
            value={formatCurrency(stats.monthlyRevenue)}
            icon={icons.payment}
            color="#5856D6"
          />
          <StatCard
            title="Bekleyen Randevular"
            value={stats.pendingAppointments}
            icon={icons.hourglass}
            color="#FF9500"
          />
          <StatCard
            title="Toplam Müşteri"
            value={stats.clientCount}
            icon={icons.person}
            color="#FF2D55"
          />
        </View>

        {/* Grafik - Aylık Randevu Dağılımı */}
        <View className="mb-6">
          <Text className="text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4">
            Aylık Randevu Dağılımı
          </Text>
          <View className="p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]">
            <LineChart
              data={appointmentDistribution}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.card.background(isDarkMode),
                backgroundGradientFrom:
                  theme.colors.card.background(isDarkMode),
                backgroundGradientTo: theme.colors.card.background(isDarkMode),
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.accent.primary,
                labelColor: (opacity = 1) =>
                  theme.colors.text.primary(isDarkMode),
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: theme.colors.accent.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>

        {/* Grafik - Popüler Stiller */}
        <View className="mb-6">
          <Text className="text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4">
            Popüler Stiller
          </Text>
          <View className="p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]">
            <BarChart
              data={popularStyles}
              width={width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: theme.colors.card.background(isDarkMode),
                backgroundGradientFrom:
                  theme.colors.card.background(isDarkMode),
                backgroundGradientTo: theme.colors.card.background(isDarkMode),
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.accent.primary,
                labelColor: (opacity = 1) =>
                  theme.colors.text.primary(isDarkMode),
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>

        {/* Yönetim Kartları */}
        <View className="mb-6">
          <AdminCard
            title="Portfolyo Yönetimi"
            icon={icons.gallery}
            onPress={() => router.push('/admin/portfolio-management')}
          />
          <AdminCard
            title="Randevu Yönetimi"
            icon={icons.calendar}
            onPress={() => router.push('/admin/appointments-management')}
          />
          <AdminCard
            title="Ödemeler"
            icon={icons.payment}
            onPress={() => router.push('/admin/payments')}
          />
          <AdminCard
            title="Ayarlar"
            icon={icons.settings}
            onPress={() => router.push('/admin/settings')}
          />
        </View>

        {/* Gelir Özeti */}
        <View
          className={`p-4 rounded-2xl mb-4 bg-[${theme.colors.card.background(isDarkMode)}] border-[1px] border-[${theme.colors.border.primary(isDarkMode)}]`}
        >
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.secondary(isDarkMode)}]`}
          >
            Aylık Gelir
          </Text>
          <Text
            className={`text-2xl font-rubik-bold text-[${theme.colors.accent.primary}] mt-2`}
          >
            {formatCurrency(monthlyRevenue || 0)}
          </Text>
        </View>

        {/* Demografik Veriler */}
        <View
          className={`p-4 rounded-2xl bg-[${theme.colors.card.background(isDarkMode)}]`}
        >
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-4`}
          >
            Dövme Stilleri Dağılımı
          </Text>
          <PieChart
            data={chartData}
            width={300}
            height={200}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            chartConfig={{
              backgroundColor: theme.colors.background.primary(isDarkMode),
              backgroundGradientFrom:
                theme.colors.background.primary(isDarkMode),
              backgroundGradientTo: theme.colors.background.primary(isDarkMode),
              color: (opacity = 1) =>
                isDarkMode
                  ? `rgba(224, 224, 224, ${opacity})`
                  : `rgba(25, 29, 49, ${opacity})`,
              labelColor: (opacity = 1) =>
                isDarkMode
                  ? `rgba(224, 224, 224, ${opacity})`
                  : `rgba(25, 29, 49, ${opacity})`,
            }}
          />
        </View>

        {/* Günlük randevu grafiği */}
        <LineChart
          data={metrics.dailyAppointments}
          width={300}
          height={200}
          chartConfig={{
            backgroundColor: theme.colors.background.primary(isDarkMode),
            backgroundGradientFrom: theme.colors.background.primary(isDarkMode),
            backgroundGradientTo: theme.colors.background.primary(isDarkMode),
            color: (opacity = 1) =>
              isDarkMode
                ? `rgba(224, 224, 224, ${opacity})`
                : `rgba(25, 29, 49, ${opacity})`,
            labelColor: (opacity = 1) =>
              isDarkMode
                ? `rgba(224, 224, 224, ${opacity})`
                : `rgba(25, 29, 49, ${opacity})`,
          }}
        />

        {/* Popüler stiller */}
        <BarChart
          data={metrics.popularStyles}
          width={300}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: theme.colors.background.primary(isDarkMode),
            backgroundGradientFrom: theme.colors.background.primary(isDarkMode),
            backgroundGradientTo: theme.colors.background.primary(isDarkMode),
            color: (opacity = 1) =>
              isDarkMode
                ? `rgba(224, 224, 224, ${opacity})`
                : `rgba(25, 29, 49, ${opacity})`,
            labelColor: (opacity = 1) =>
              isDarkMode
                ? `rgba(224, 224, 224, ${opacity})`
                : `rgba(25, 29, 49, ${opacity})`,
          }}
        />

        {/* Müşteri memnuniyeti */}
        <SatisfactionMeter value={metrics.customerSatisfaction} />
      </ScrollView>
    </SafeAreaView>
  );
}

// İstatistik kartı komponenti
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) => {
  const { isDarkMode, theme } = useTheme();

  return (
    <View
      className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] w-1/2 mr-2 mb-4`}
      style={{
        shadowColor: color,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      }}
    >
      <View className="flex-row items-center mb-2">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center bg-[${color}]/20`}
        >
          <Image
            source={icon}
            className="w-5 h-5"
            style={{ tintColor: color }}
          />
        </View>
        <Text
          className={`ml-2 text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
        >
          {title}
        </Text>
      </View>
      <Text
        className={`text-xl font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}]`}
      >
        {value}
      </Text>
    </View>
  );
};
