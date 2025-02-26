import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme-provider';
import { portfolioService } from '@/lib/services/portfolio';
import { useGlobalContext } from '@/lib/global-provider';
import { favoritesService } from '@/lib/services/favorites';
import FastImage from 'react-native-fast-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { Image } from '@rneui/themed';
import icons from '@/constants/icons';
import { Icon } from '@rneui/themed';

// Interface tanımı ekleyin
interface PortfolioItem {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  imageUrl: string;
  style: string;
}

interface AppwriteDocument {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  images: string[]; // Appwrite'daki gerçek alan adı
  title: string; // Appwrite'daki gerçek alan adı
}

export default function Portfolio() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);

  const categories = ['all', 'minimal', 'realistik', 'traditional', 'tribal'];

  // Filtreleme seçenekleri
  const [filters, setFilters] = useState({
    category: 'all',
    style: 'all',
    size: 'all',
    sortBy: 'recent', // recent, popular
  });

  useEffect(() => {
    loadPortfolioItems();
    if (user?.$id) {
      loadUserFavorites();
    }
  }, [filters, user]);

  const loadPortfolioItems = async (pageNum = 1) => {
    try {
      setLoading(true);

      // Filtreleme seçeneklerine göre sorgu oluştur
      const queryOptions: any = {};

      if (filters.category !== 'all') {
        queryOptions.category = filters.category;
      }

      if (filters.style !== 'all') {
        queryOptions.style = filters.style;
      }

      if (filters.size !== 'all') {
        queryOptions.size = filters.size;
      }

      // Sıralamayı ayarla
      const sortOption =
        filters.sortBy === 'recent'
          ? { field: 'createdAt', direction: 'desc' }
          : { field: 'likes', direction: 'desc' };

      const response = await portfolioService.list(pageNum, {
        ...queryOptions,
        sort: sortOption,
      });

      const items = (response.documents as unknown as AppwriteDocument[]).map(
        (doc) => ({
          ...doc,
          imageUrl: doc.images[0],
          style: doc.title,
        })
      ) as PortfolioItem[];

      // Sayfa 1'den büyükse, mevcut öğelere ekle, değilse yeniden ayarla
      if (pageNum > 1) {
        setPortfolioItems((prev) => [...prev, ...items]);
      } else {
        setPortfolioItems(items);
      }

      setPage(pageNum);
    } catch (error) {
      console.error('Portfolyo yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    try {
      const userFavorites = await favoritesService.getUserFavorites(user!.$id);
      setFavorites(userFavorites.map((fav) => fav.portfolioItemId));
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    }
  };

  const toggleFavorite = async (itemId: string) => {
    try {
      if (favorites.includes(itemId)) {
        await favoritesService.removeFromFavorites(itemId);
        setFavorites((prev) => prev.filter((id) => id !== itemId));
      } else {
        await favoritesService.addToFavorites(user!.$id, itemId);
        setFavorites((prev) => [...prev, itemId]);
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
    }
  };

  // Filtreleme paneli
  const FilterPanel = () => {
    return (
      <View className="mb-4">
        {/* Kategori Filtreleri */}
        <Text
          className={`text-sm mb-2 text-[${theme.colors.text.secondary(isDarkMode)}]`}
        >
          Kategoriler
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {['all', 'minimal', 'realistik', 'traditional', 'tribal'].map(
            (category) => (
              <Pressable
                key={category}
                onPress={() => setFilters((prev) => ({ ...prev, category }))}
                className={`mr-2 px-4 py-2 rounded-full ${
                  filters.category === category
                    ? `bg-[${theme.colors.accent.primary}]`
                    : `bg-[${theme.colors.card.background(isDarkMode)}]`
                }`}
              >
                <Text
                  className={`${
                    filters.category === category
                      ? 'text-white'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {category === 'all'
                    ? 'Tümü'
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* Boyut Filtreleri */}
        <Text
          className={`text-sm mb-2 text-[${theme.colors.text.secondary(isDarkMode)}]`}
        >
          Boyut
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {['all', 'küçük', 'orta', 'büyük', 'çok büyük'].map((size) => (
            <Pressable
              key={size}
              onPress={() => setFilters((prev) => ({ ...prev, size }))}
              className={`mr-2 px-4 py-2 rounded-full ${
                filters.size === size
                  ? `bg-[${theme.colors.accent.primary}]`
                  : `bg-[${theme.colors.card.background(isDarkMode)}]`
              }`}
            >
              <Text
                className={`${
                  filters.size === size
                    ? 'text-white'
                    : `text-[${theme.colors.text.primary(isDarkMode)}]`
                }`}
              >
                {size === 'all'
                  ? 'Tümü'
                  : size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Sıralama Seçenekleri */}
        <Text
          className={`text-sm mb-2 text-[${theme.colors.text.secondary(isDarkMode)}]`}
        >
          Sıralama
        </Text>
        <View className="flex-row">
          <Pressable
            onPress={() =>
              setFilters((prev) => ({ ...prev, sortBy: 'recent' }))
            }
            className={`mr-2 px-4 py-2 rounded-full ${
              filters.sortBy === 'recent'
                ? `bg-[${theme.colors.accent.primary}]`
                : `bg-[${theme.colors.card.background(isDarkMode)}]`
            }`}
          >
            <Text
              className={`${
                filters.sortBy === 'recent'
                  ? 'text-white'
                  : `text-[${theme.colors.text.primary(isDarkMode)}]`
              }`}
            >
              En Yeni
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setFilters((prev) => ({ ...prev, sortBy: 'popular' }))
            }
            className={`mr-2 px-4 py-2 rounded-full ${
              filters.sortBy === 'popular'
                ? `bg-[${theme.colors.accent.primary}]`
                : `bg-[${theme.colors.card.background(isDarkMode)}]`
            }`}
          >
            <Text
              className={`${
                filters.sortBy === 'popular'
                  ? 'text-white'
                  : `text-[${theme.colors.text.primary(isDarkMode)}]`
              }`}
            >
              En Popüler
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // Galeri öğesi yeniden düzenleme
  const PortfolioItem = ({
    item,
    index,
  }: {
    item: PortfolioItem;
    index: number;
  }) => {
    // FastImage URI'ları önce yükleyelim
    useEffect(() => {
      FastImage.preload([{ uri: item.imageUrl }]);
    }, [item.imageUrl]);

    return (
      <Animated.View
        entering={FadeInDown.delay(100 + index * 50).springify()}
        className="w-1/2 p-2"
      >
        <Pressable
          onPress={() => router.push(`/portfolio/${item.$id}`)}
          className="rounded-2xl overflow-hidden"
          style={{
            shadowColor: theme.colors.accent.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          <FastImage
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', aspectRatio: 1 }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <BlurView intensity={80} className="absolute bottom-0 w-full p-3">
            <Text className="text-white font-rubik-medium text-base">
              {item.style}
            </Text>
            {user && (
              <Pressable
                onPress={() => toggleFavorite(item.$id)}
                className="absolute top-3 right-3"
              >
                <Icon
                  name={
                    favorites.includes(item.$id) ? 'heart' : 'heart-outline'
                  }
                  size={24}
                  color={
                    favorites.includes(item.$id)
                      ? theme.colors.accent.primary
                      : 'white'
                  }
                />
              </Pressable>
            )}
          </BlurView>
        </Pressable>
      </Animated.View>
    );
  };

  const loadMoreItems = async () => {
    if (loading) return;
    const nextPage = page + 1;
    try {
      const response = await portfolioService.list(nextPage, {
        ...filters,
        sort:
          filters.sortBy === 'recent'
            ? { field: 'createdAt', direction: 'desc' }
            : { field: 'likes', direction: 'desc' },
      });

      const newItems = (
        response.documents as unknown as AppwriteDocument[]
      ).map((doc) => ({
        ...doc,
        imageUrl: doc.images[0],
        style: doc.title,
      }));

      // Mevcut öğelere yeni öğeleri ekle ve sayfayı güncelle
      setPortfolioItems([...portfolioItems, ...newItems]);
      setPage(nextPage);
    } catch (error) {
      console.error('Daha fazla portfolyo öğesi yükleme hatası:', error);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
      style={{ paddingBottom: 70 }}
    >
      {/* Sticky Header */}
      <Animated.View
        entering={FadeInDown.delay(100)}
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          backgroundColor: theme.colors.background.primary(isDarkMode),
          shadowColor: theme.colors.accent.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <View className="px-4 pt-4 pb-2">
          <Text
            className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            Portfolyo
          </Text>
          <Text
            className={`text-sm font-rubik mt-1 text-[${theme.colors.text.secondary(isDarkMode)}]`}
          >
            En iyi çalışmalarımızı keşfedin
          </Text>
        </View>

        {/* Kategoriler - Yatay ScrollView */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2 px-4"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((category) => (
            <Animated.View
              key={category}
              entering={FadeInDown.delay(200).springify()}
            >
              <Pressable
                onPress={() => setSelectedCategory(category)}
                className={`mr-2 px-6 py-3 rounded-full border ${
                  selectedCategory === category
                    ? `bg-[${theme.colors.accent.primary}] border-transparent`
                    : `border-[${theme.colors.accent.primary}]/20 bg-transparent`
                }`}
              >
                <Text
                  className={`font-rubik-medium text-sm ${
                    selectedCategory === category
                      ? 'text-blue-950'
                      : `text-[${theme.colors.text.primary(isDarkMode)}]`
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Portfolio Grid - Yeni tasarım */}
      <ScrollView className="flex-1 mt-32" showsVerticalScrollIndicator={false}>
        <FilterPanel />

        {loading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator
              color={theme.colors.accent.primary}
              size="large"
            />
          </View>
        ) : (
          <View className="px-2">
            <FlashList
              data={portfolioItems}
              renderItem={({ item, index }) => (
                <PortfolioItem item={item} index={index} />
              )}
              estimatedItemSize={200}
              numColumns={2}
              onEndReached={() => {
                if (!loading && portfolioItems.length >= 10) {
                  loadMoreItems();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loading && portfolioItems.length > 0 ? (
                  <ActivityIndicator
                    color={theme.colors.accent.primary}
                    style={{ padding: 20 }}
                  />
                ) : null
              }
              ListEmptyComponent={
                !loading ? (
                  <Text
                    className={`text-center py-10 text-[${theme.colors.text.secondary(isDarkMode)}]`}
                  >
                    Bu kategoride henüz çalışma bulunmuyor
                  </Text>
                ) : null
              }
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
