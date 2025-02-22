import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { FlashList } from '@shopify/flash-list';
import { clientService, Client } from '@/lib/services/client';
import { SwipeableRow } from '@/components/SwipeableRow';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import icons from '@/constants/icons';

export default function ClientManagement() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadClients();
  }, [debouncedSearch]);

  const loadClients = async (refresh = false) => {
    try {
      setLoading(true);
      if (refresh) setPage(1);

      const response = await clientService.list(
        refresh ? 1 : page,
        debouncedSearch
      );

      setClients((prev) =>
        refresh
          ? response.documents.map(mapClientData)
          : [...prev, ...response.documents.map(mapClientData)]
      );

      if (!refresh) setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Müşteri listesi yükleme hatası:', error);
      Alert.alert('Hata', 'Müşteri listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const mapClientData = (doc: any): Client => ({
    ...doc,
    name: doc.name,
    email: doc.email,
    status: doc.status,
    createdAt: doc.createdAt,
    role: doc.role,
  });

  const handleStatusChange = async (
    clientId: string,
    newStatus: Client['status']
  ) => {
    try {
      await clientService.updateStatus(clientId, newStatus);
      loadClients(true);
      Alert.alert('Başarılı', 'Müşteri durumu güncellendi');
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      Alert.alert('Hata', 'Durum güncellenirken bir hata oluştu');
    }
  };

  const ClientListItem = ({ client }: { client: Client }) => (
    <SwipeableRow
      onDelete={() => {
        Alert.alert(
          'Durum Değiştir',
          'Bu müşterinin durumunu ne yapmak istersiniz?',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: client.status === 'blocked' ? 'Aktifleştir' : 'Engelle',
              style: client.status === 'blocked' ? 'default' : 'destructive',
              onPress: () =>
                handleStatusChange(
                  client.$id,
                  client.status === 'blocked' ? 'active' : 'blocked'
                ),
            },
          ]
        );
      }}
    >
      <Pressable
        onPress={() => router.push(`/admin/client/${client.$id}`)}
        className={`p-4 bg-[${theme.colors.card.background(isDarkMode)}] rounded-xl mb-4`}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
            >
              {client.name}
            </Text>
            <Text
              className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
            >
              {client.email}
            </Text>
          </View>
          <View className="items-end">
            <View
              className={`px-3 py-1 rounded-full ${
                client.status === 'active'
                  ? 'bg-green-500/20'
                  : client.status === 'blocked'
                    ? 'bg-red-500/20'
                    : 'bg-yellow-500/20'
              }`}
            >
              <Text
                className={`text-sm ${
                  client.status === 'active'
                    ? 'text-green-500'
                    : client.status === 'blocked'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                }`}
              >
                {client.status === 'active'
                  ? 'Aktif'
                  : client.status === 'blocked'
                    ? 'Engelli'
                    : 'Pasif'}
              </Text>
            </View>
            {client.createdAt && (
              <Text
                className={`text-xs text-[${theme.colors.text.secondary(isDarkMode)}] mt-1`}
              >
                Kayıt:{' '}
                {format(new Date(client.createdAt), 'd MMM yyyy', {
                  locale: tr,
                })}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </SwipeableRow>
  );

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <View className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          Müşteri Yönetimi
        </Text>

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
              value={search}
              onChangeText={setSearch}
              placeholder="Müşteri Ara..."
              className={`flex-1 p-4 text-[${theme.colors.text.primary(isDarkMode)}]`}
              placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
            />
          </View>
        </View>

        <FlashList
          data={clients}
          renderItem={({ item }) => <ClientListItem client={item} />}
          estimatedItemSize={88}
          onRefresh={() => loadClients(true)}
          refreshing={loading}
          onEndReached={() => loadClients()}
          onEndReachedThreshold={0.5}
        />
      </View>
    </SafeAreaView>
  );
}
