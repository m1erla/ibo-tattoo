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

  const categories = ['all', 'minimal', 'realistik', 'traditional', 'tribal'];

  useEffect(() => {
    loadPortfolioItems();
    if (user?.$id) {
      loadUserFavorites();
    }
  }, [selectedCategory, user]);

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      const response = await portfolioService.list(1, {
        style: selectedCategory === 'all' ? undefined : selectedCategory,
      });

      const items = (response.documents as unknown as AppwriteDocument[]).map(
        (doc) => ({
          ...doc,
          imageUrl: doc.images[0],
          style: doc.title,
        })
      ) as PortfolioItem[];

      setPortfolioItems(items);
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

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
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
              numColumns={2}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.delay(200 + index * 100).springify()}
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
                      className="w-full aspect-square"
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <BlurView
                      intensity={80}
                      className="absolute bottom-0 w-full p-3"
                    >
                      <Text className="text-white font-rubik-medium text-base">
                        {item.style}
                      </Text>
                      {user && (
                        <Pressable
                          onPress={() => toggleFavorite(item.$id)}
                          className="absolute top-3 right-3"
                          style={{
                            transform: [
                              { scale: favorites.includes(item.$id) ? 1.1 : 1 },
                            ],
                          }}
                        >
                          <Animated.Image
                            source={icons.heart}
                            className="w-6 h-6"
                            style={{
                              tintColor: favorites.includes(item.$id)
                                ? theme.colors.accent.primary
                                : 'white',
                            }}
                          />
                        </Pressable>
                      )}
                    </BlurView>
                  </Pressable>
                </Animated.View>
              )}
              estimatedItemSize={200}
              ListEmptyComponent={
                <Animated.View
                  entering={FadeInDown.delay(300)}
                  className="py-12 px-4"
                >
                  <Text
                    className={`text-center text-lg font-rubik-medium text-[${theme.colors.text.secondary(isDarkMode)}]`}
                  >
                    Bu kategoride henüz çalışma bulunmuyor
                  </Text>
                </Animated.View>
              }
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
