import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGlobalContext } from '@/lib/global-provider';
import { LazyImage } from 'react-native-lazy-image-loader';
import { useState, useEffect } from 'react';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { Models } from 'react-native-appwrite';
import { Image as RNEImage } from '@rneui/themed';
import FastImage from 'react-native-fast-image';

interface PortfolioItem extends Models.Document {
  imageUrl: string;
  style: string;
  description: string;
  tags: string[];
}

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'minimal', 'realistik', 'traditional', 'tribal'];

  useEffect(() => {
    loadPortfolioItems();
  }, [selectedCategory]);

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc('$createdAt')];

      if (selectedCategory !== 'all') {
        queries.push(Query.equal('style', selectedCategory));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.portfolioCollectionId!,
        queries
      );

      setPortfolioItems(response.documents as unknown as PortfolioItem[]);
    } catch (error) {
      console.error('Portfolyo yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePortfolioItemPress = (item: PortfolioItem) => {
    // Detay sayfasına yönlendirme yapılacak
    console.log('Portfolio item pressed:', item);
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-rubik-semibold text-black-300">
            Portfolyo
          </Text>
        </View>

        {/* Filtreler */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 px-4"
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => handleCategoryPress(category)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategory === category ? 'bg-primary-300' : 'bg-white'
              }`}
            >
              <Text
                className={`font-rubik-medium ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-black-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Portfolyo Grid */}
        <View className="mt-6 px-4 flex-row flex-wrap justify-between">
          {loading ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator color="#0061FF" size="large" />
            </View>
          ) : portfolioItems.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-black-300 font-rubik-medium">
                Bu kategoride henüz çalışma bulunmuyor
              </Text>
            </View>
          ) : (
            portfolioItems.map((item) => (
              <Animated.View
                key={item.$id}
                entering={FadeInDown.delay(200).springify()}
                className="w-[48%] mb-4"
              >
                <Pressable
                  onPress={() => handlePortfolioItemPress(item)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <FastImage
                    source={{ uri: item.imageUrl }}
                    style={{ width: '100%', height: 192 }}
                    resizeMode={FastImage.resizeMode.cover}
                    defaultSource={require('@/assets/images/placeholder.png')}
                  />
                  <View className="p-3">
                    <Text className="font-rubik-medium text-black-300">
                      {item.style}
                    </Text>
                    <Text className="text-black-100 text-sm mt-1">
                      {item.description}
                    </Text>
                    <View className="flex-row flex-wrap mt-2">
                      {item.tags.map((tag, index) => (
                        <View
                          key={index}
                          className="bg-accent-100 px-2 py-1 rounded-full mr-1 mb-1"
                        >
                          <Text className="text-xs text-black-300">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
