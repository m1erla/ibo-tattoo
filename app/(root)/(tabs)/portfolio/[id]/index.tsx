import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { portfolioService } from '@/lib/services/portfolio';
import { useTheme } from '@/lib/theme-provider';
import { Image } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGlobalContext } from '@/lib/global-provider';
import { favoritesService } from '@/lib/services/favorites';

interface PortfolioItemDetail {
  $id: string;
  imageUrl: string;
  beforeImageUrl?: string;
  category: string;
  style: string;
  size: string;
  description: string;
  tags: string[];
}

const { width } = Dimensions.get('window');

export default function PortfolioDetail() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<PortfolioItemDetail | null>(null);
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const { user } = useGlobalContext();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadPortfolioItem = async () => {
      try {
        if (!id) {
          setError('Geçersiz ID parametresi');
          return;
        }

        setLoading(true);
        const response = await portfolioService.getItemById(id);

        // Document'i PortfolioItemDetail'e dönüştür
        const portfolioItem: PortfolioItemDetail = {
          $id: response.$id,
          imageUrl: response.imageUrl,
          beforeImageUrl: response.beforeImageUrl,
          category: response.category,
          style: response.style,
          size: response.size,
          description: response.description,
          tags: response.tags,
        };

        setItem(portfolioItem);

        // Favori kontrolü
        if (user?.$id) {
          const favorites = await favoritesService.getUserFavorites(user.$id);
          setIsFavorite(favorites.some((fav) => fav.portfolioItemId === id));
        }
      } catch (error) {
        console.error('Portfolyo detay yükleme hatası:', error);
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioItem();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!user?.$id || !item?.$id) return;

    try {
      if (isFavorite) {
        const favorites = await favoritesService.getUserFavorites(user.$id);
        const favorite = favorites.find(
          (fav) => fav.portfolioItemId === item.$id
        );
        if (favorite) {
          await favoritesService.removeFromFavorites(item.$id);
        }
      } else {
        await favoritesService.addToFavorites(user.$id, item.$id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
    }
  };

  if (error) {
    return (
      <SafeAreaView>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 font-rubik-medium text-center">
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !item) {
    return (
      <SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <View className="relative">
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width, height: width }}
            PlaceholderContent={<ActivityIndicator />}
          />
          <Pressable
            onPress={handleFavoriteToggle}
            className="absolute top-4 right-4"
          >
            <BlurView intensity={30} className="p-2 rounded-full">
              <Image
                source={require('@/assets/icons/heart.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: isFavorite ? theme.colors.accent.primary : 'white',
                }}
              />
            </BlurView>
          </Pressable>
        </View>

        <View className="p-4">
          <Text
            className={`text-2xl font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            {item.style}
          </Text>
          <Text
            className={`mt-2 text-[${theme.colors.text.secondary(isDarkMode)}]`}
          >
            {item.description}
          </Text>

          <View className="flex-row flex-wrap mt-4">
            {item.tags.map((tag, index) => (
              <View
                key={index}
                className={`px-3 py-1 rounded-full mr-2 mb-2 bg-[${theme.colors.card.background(isDarkMode)}]`}
              >
                <Text
                  className={`text-[${theme.colors.text.primary(isDarkMode)}]`}
                >
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
