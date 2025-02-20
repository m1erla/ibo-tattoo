import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyticsService } from '@/lib/services/analytics';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/lib/theme-provider';

export default function Dashboard() {
  const { isDarkMode, theme } = useTheme();
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [demographics, setDemographics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const revenue = await analyticsService.getMonthlyRevenue();
        const demo = await analyticsService.getCustomerDemographics();

        setMonthlyRevenue(revenue);
        setDemographics(demo || {});
      } catch (error) {
        console.error('Dashboard veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
          className={`text-2xl font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}]`}
        >
          Admin Dashboard
        </Text>

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
            {monthlyRevenue.toLocaleString('tr-TR')} ₺
          </Text>
        </View>

        {/* Demografik Veriler */}
        <View className="bg-white p-4 rounded-2xl">
          <Text className="text-lg font-rubik-medium text-black-300 mb-4">
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
              backgroundColor: isDarkMode ? '#121212' : '#FAFAFA',
              backgroundGradientFrom: isDarkMode ? '#121212' : '#FAFAFA',
              backgroundGradientTo: isDarkMode ? '#121212' : '#FAFAFA',
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
      </ScrollView>
    </SafeAreaView>
  );
}
