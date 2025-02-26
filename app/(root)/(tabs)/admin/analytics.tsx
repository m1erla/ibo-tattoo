import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { analyticsService, MonthlyStats } from '@/lib/services/analytics';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { format, Locale, subMonths } from 'date-fns';
import { useLanguage } from '@/lib/services/language';
import { tr, enUS, de, nl } from 'date-fns/locale';

// Dil localleri için mapping
const dateLocales: Record<string, Locale> = {
  tr,
  en: enUS,
  de,
  nl,
};

const { width } = Dimensions.get('window');

export default function Analytics() {
  const { isDarkMode, theme } = useTheme();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [popularStyles, setPopularStyles] = useState<
    { style: string; count: number }[]
  >([]);
  const [demographics, setDemographics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Son 6 ayın istatistiklerini al
      const monthlyStatsPromises = Array.from({ length: 6 }).map((_, i) =>
        analyticsService.getMonthlyStats(i)
      );

      const [stats, styles, demo] = await Promise.all([
        Promise.all(monthlyStatsPromises),
        analyticsService.getPopularStyles(),
        analyticsService.getClientDemographics(),
      ]);

      setMonthlyStats(stats);
      setPopularStyles(styles);
      setDemographics(demo);
    } catch (error) {
      console.error('Analiz yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const revenueData = {
    labels: monthlyStats
      .map((_, i) => {
        const currentLocale = dateLocales[locale] || tr;
        return format(subMonths(new Date(), i), 'MMM', {
          locale: currentLocale,
        });
      })
      .reverse(),
    datasets: [
      {
        data: monthlyStats.map((stat) => stat.revenue).reverse(),
      },
    ],
  };

  const styleData = popularStyles.slice(0, 5).map((item) => ({
    name: item.style,
    count: item.count,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    legendFontColor: theme.colors.text.primary(isDarkMode),
  }));

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
      style={{ paddingBottom: 70 }}
    >
      <ScrollView className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          {t('admin.statistics')}
        </Text>

        {/* Aylık Gelir Grafiği */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
          >
            Aylık Gelir
          </Text>
          <LineChart
            data={revenueData}
            width={width - 32}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.card.background(isDarkMode),
              backgroundGradientFrom: theme.colors.card.background(isDarkMode),
              backgroundGradientTo: theme.colors.card.background(isDarkMode),
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.accent.primary,
              labelColor: (opacity = 1) =>
                theme.colors.text.primary(isDarkMode),
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
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

        {/* Popüler Stiller */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
          >
            Popüler Stiller
          </Text>
          <PieChart
            data={styleData}
            width={width - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => theme.colors.text.primary(isDarkMode),
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>

        {/* Özet İstatistikler */}
        <View className="flex-row flex-wrap">
          {monthlyStats[0] && (
            <>
              <View className={`w-1/2 p-2`}>
                <View
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
                >
                  <Text
                    className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
                  >
                    Bu Ay Randevu
                  </Text>
                  <Text
                    className={`text-xl font-rubik-bold text-[${theme.colors.accent.primary}]`}
                  >
                    {monthlyStats[0].appointments}
                  </Text>
                </View>
              </View>

              <View className={`w-1/2 p-2`}>
                <View
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
                >
                  <Text
                    className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
                  >
                    Yeni Müşteri
                  </Text>
                  <Text
                    className={`text-xl font-rubik-bold text-[${theme.colors.accent.primary}]`}
                  >
                    {monthlyStats[0].newClients}
                  </Text>
                </View>
              </View>

              <View className={`w-1/2 p-2`}>
                <View
                  className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
                >
                  <Text
                    className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
                  >
                    Ortalama Puan
                  </Text>
                  <Text
                    className={`text-xl font-rubik-bold text-[${theme.colors.accent.primary}]`}
                  >
                    {monthlyStats[0].averageRating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
