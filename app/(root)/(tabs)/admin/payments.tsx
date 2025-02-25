import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import icons from '@/constants/icons';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';

export default function Payments() {
  const { isDarkMode, theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
  });
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPayments();
  }, [dateFilter, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Ödeme verileri gerçek veritabanı tarafından sağlanacak
      const queries: any[] = [Query.orderDesc('createdAt')];

      // Tarih filtreleri
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        queries.push(Query.greaterThanEqual('createdAt', today.toISOString()));
      } else if (dateFilter === 'week') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        queries.push(
          Query.greaterThanEqual('createdAt', lastWeek.toISOString())
        );
      } else if (dateFilter === 'month') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        queries.push(
          Query.greaterThanEqual('createdAt', lastMonth.toISOString())
        );
      }

      // Durum filtreleri
      if (statusFilter !== 'all') {
        queries.push(Query.equal('status', statusFilter));
      }

      // Arama filtresi
      if (searchText) {
        queries.push(Query.search('clientName', searchText));
      }

      // Ödeme listesini al
      const response = await databases.listDocuments(
        appwriteConfig.databaseId!,
        'payments', // Ödemeler koleksiyonu
        queries
      );

      setPayments(response.documents);

      // İstatistikleri hesapla
      calculateStatistics(response.documents);
    } catch (error) {
      console.error('Ödeme listesi getirme hatası:', error);
      Alert.alert('Hata', 'Ödemeler yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (paymentData: any[]) => {
    const total = paymentData.reduce((sum, payment) => sum + payment.amount, 0);
    const completed = paymentData.filter(
      (payment) => payment.status === 'completed'
    ).length;
    const pending = paymentData.filter(
      (payment) => payment.status === 'pending'
    ).length;

    setStatistics({
      totalRevenue: total,
      completedPayments: completed,
      pendingPayments: pending,
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('tr-TR')} ₺`;
  };

  const renderPaymentItem = ({ item }: { item: any }) => {
    return (
      <View
        className={`p-4 mb-3 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
            >
              {item.clientName}
            </Text>
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              {format(new Date(item.createdAt), 'd MMMM yyyy', { locale: tr })}
            </Text>
          </View>
          <View className="items-end">
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.accent.primary}]`}
            >
              {formatCurrency(item.amount)}
            </Text>
            <View
              className={`px-3 py-1 rounded-full mt-1 ${
                item.status === 'completed'
                  ? 'bg-green-500/20'
                  : item.status === 'pending'
                    ? 'bg-amber-500/20'
                    : 'bg-red-500/20'
              }`}
            >
              <Text
                className={`text-xs font-rubik-medium ${
                  item.status === 'completed'
                    ? 'text-green-500'
                    : item.status === 'pending'
                      ? 'text-amber-500'
                      : 'text-red-500'
                }`}
              >
                {item.status === 'completed'
                  ? 'Tamamlandı'
                  : item.status === 'pending'
                    ? 'Beklemede'
                    : 'İptal Edildi'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <View className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          Ödeme Yönetimi
        </Text>

        {/* İstatistik Kartları */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View
            className={`mr-4 p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] min-w-[150px]`}
          >
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              Toplam Gelir
            </Text>
            <Text
              className={`text-xl font-rubik-bold text-[${theme.colors.accent.primary}] mt-1`}
            >
              {formatCurrency(statistics.totalRevenue)}
            </Text>
          </View>

          <View
            className={`mr-4 p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] min-w-[150px]`}
          >
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              Tamamlanan Ödemeler
            </Text>
            <Text className={`text-xl font-rubik-bold text-green-500 mt-1`}>
              {statistics.completedPayments}
            </Text>
          </View>

          <View
            className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] min-w-[150px]`}
          >
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              Bekleyen Ödemeler
            </Text>
            <Text className={`text-xl font-rubik-bold text-amber-500 mt-1`}>
              {statistics.pendingPayments}
            </Text>
          </View>
        </ScrollView>

        {/* Arama ve Filtreler */}
        <View className="mb-4">
          <View
            className={`flex-row items-center px-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
          >
            <Image
              source={icons.search}
              className="w-5 h-5"
              style={{ tintColor: theme.colors.text.secondary(isDarkMode) }}
            />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={loadPayments}
              placeholder="Müşteri Adı Ara..."
              className={`flex-1 p-4 text-[${theme.colors.text.primary(isDarkMode)}]`}
              placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
            />
          </View>
        </View>

        {/* Tarih Filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          {['all', 'today', 'week', 'month'].map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setDateFilter(filter)}
              className={`px-4 py-2 mr-2 rounded-full ${
                dateFilter === filter
                  ? `bg-[${theme.colors.accent.primary}]`
                  : `bg-[${theme.colors.card.background(isDarkMode)}]`
              }`}
            >
              <Text
                className={`font-rubik-medium ${
                  dateFilter === filter
                    ? 'text-white'
                    : `text-[${theme.colors.text.primary(isDarkMode)}]`
                }`}
              >
                {filter === 'all'
                  ? 'Tümü'
                  : filter === 'today'
                    ? 'Bugün'
                    : filter === 'week'
                      ? 'Bu Hafta'
                      : 'Bu Ay'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Durum Filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {['all', 'completed', 'pending', 'cancelled'].map((status) => (
            <Pressable
              key={status}
              onPress={() => setStatusFilter(status)}
              className={`px-4 py-2 mr-2 rounded-full ${
                statusFilter === status
                  ? `bg-[${theme.colors.accent.primary}]`
                  : `bg-[${theme.colors.card.background(isDarkMode)}]`
              }`}
            >
              <Text
                className={`font-rubik-medium ${
                  statusFilter === status
                    ? 'text-white'
                    : `text-[${theme.colors.text.primary(isDarkMode)}]`
                }`}
              >
                {status === 'all'
                  ? 'Tüm Durumlar'
                  : status === 'completed'
                    ? 'Tamamlanan'
                    : status === 'pending'
                      ? 'Bekleyen'
                      : 'İptal Edilen'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Ödeme Listesi */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={theme.colors.accent.primary} />
          </View>
        ) : (
          <FlashList
            data={payments}
            renderItem={renderPaymentItem}
            estimatedItemSize={100}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Text
                  className={`text-[${theme.colors.text.secondary(isDarkMode)}] text-center`}
                >
                  Ödeme kaydı bulunamadı
                </Text>
              </View>
            }
            onRefresh={loadPayments}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
