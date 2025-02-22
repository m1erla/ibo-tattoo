import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native-gesture-handler';
import { portfolioService, PortfolioItem } from '@/lib/services/portfolio';
import { BlurView } from 'expo-blur';
import { SwipeableRow } from '@/components/SwipeableRow';
import { FlashList } from '@shopify/flash-list';
import icons from '@/constants/icons';

export default function PortfolioManagement() {
  const { isDarkMode, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    style: '',
    size: '',
    description: '',
    tags: '',
    imageFile: null as ImagePicker.ImagePickerAsset | null,
    beforeImage: null as ImagePicker.ImagePickerAsset | null,
  });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPortfolioItems();
  }, []);

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      const response = await portfolioService.list();
      setPortfolioItems(response.documents as PortfolioItem[]);
    } catch (error) {
      console.error('Portfolyo listesi yükleme hatası:', error);
      Alert.alert('Hata', 'Portfolyo listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await portfolioService.deleteItem(itemId);
      Alert.alert('Başarılı', 'Portfolyo öğesi silindi');
      loadPortfolioItems();
    } catch (error) {
      console.error('Portfolyo öğesi silme hatası:', error);
      Alert.alert('Hata', 'Portfolyo öğesi silinirken bir hata oluştu');
    }
  };

  const pickImage = async (type: 'main' | 'before') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (type === 'main') {
        setFormData((prev) => ({ ...prev, imageFile: asset }));
      } else {
        setFormData((prev) => ({ ...prev, beforeImage: asset }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.imageFile) {
      Alert.alert('Hata', 'Lütfen bir resim seçin');
      return;
    }

    try {
      setLoading(true);

      await portfolioService.addItem({
        imageFile: {
          uri: formData.imageFile.uri,
          name: formData.imageFile.fileName || 'image.jpg',
          type: 'image/jpeg',
          size: formData.imageFile.fileSize || 0,
        },
        category: formData.category,
        style: formData.style,
        size: formData.size,
        description: formData.description,
        tags: formData.tags.split(',').map((tag) => tag.trim()),
        ...(formData.beforeImage && {
          beforeImage: {
            uri: formData.beforeImage.uri,
            name: formData.beforeImage.fileName || 'before.jpg',
            type: 'image/jpeg',
            size: formData.beforeImage.fileSize || 0,
          },
        }),
      });

      Alert.alert('Başarılı', 'Portfolyo öğesi eklendi');
      setFormData({
        category: '',
        style: '',
        size: '',
        description: '',
        tags: '',
        imageFile: null,
        beforeImage: null,
      });
    } catch (error) {
      console.error('Portfolyo öğesi ekleme hatası:', error);
      Alert.alert('Hata', 'Portfolyo öğesi eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const PortfolioListItem = ({ item }: { item: PortfolioItem }) => (
    <SwipeableRow
      onDelete={() => {
        Alert.alert(
          'Silme Onayı',
          'Bu portfolyo öğesini silmek istediğinizden emin misiniz?',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Sil',
              style: 'destructive',
              onPress: () => handleDelete(item.$id),
            },
          ]
        );
      }}
    >
      <View
        className={`flex-row items-center p-4 bg-[${theme.colors.card.background(isDarkMode)}] rounded-xl mb-4`}
      >
        <Image
          source={{ uri: item.imageUrl }}
          className="w-20 h-20 rounded-lg"
          PlaceholderContent={<ActivityIndicator />}
        />
        <View className="flex-1 ml-4">
          <Text
            className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            {item.style}
          </Text>
          <Text
            className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
          >
            {item.category} - {item.size}
          </Text>
        </View>
      </View>
    </SwipeableRow>
  );

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text
            className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}]`}
          >
            Portfolyo Yönetimi
          </Text>
          <Pressable
            onPress={() => setShowForm(!showForm)}
            className={`p-3 rounded-full bg-[${theme.colors.accent.primary}]`}
          >
            <Image source={icons.plus} className="w-6 h-6" tintColor="white" />
          </Pressable>
        </View>

        {showForm ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Resim Seçimi */}
            <View className="flex-row space-x-4 mb-6">
              <Pressable
                onPress={() => pickImage('main')}
                className={`flex-1 aspect-square rounded-xl overflow-hidden bg-[${theme.colors.card.background(isDarkMode)}]`}
              >
                {formData.imageFile ? (
                  <Image
                    source={{ uri: formData.imageFile.uri }}
                    className="w-full h-full"
                    PlaceholderContent={<ActivityIndicator />}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text
                      className={`text-[${theme.colors.text.secondary(isDarkMode)}]`}
                    >
                      Ana Resim Seç
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => pickImage('before')}
                className={`flex-1 aspect-square rounded-xl overflow-hidden bg-[${theme.colors.card.background(isDarkMode)}]`}
              >
                {formData.beforeImage ? (
                  <Image
                    source={{ uri: formData.beforeImage.uri }}
                    className="w-full h-full"
                    PlaceholderContent={<ActivityIndicator />}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text
                      className={`text-[${theme.colors.text.secondary(isDarkMode)}]`}
                    >
                      Öncesi Resmi (Opsiyonel)
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Form Alanları */}
            <View className="space-y-4">
              <TextInput
                value={formData.category}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, category: text }))
                }
                placeholder="Kategori"
                className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
              />

              <TextInput
                value={formData.style}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, style: text }))
                }
                placeholder="Stil"
                className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
              />

              <TextInput
                value={formData.size}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, size: text }))
                }
                placeholder="Boyut"
                className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
              />

              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Açıklama"
                multiline
                numberOfLines={4}
                className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
              />

              <TextInput
                value={formData.tags}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, tags: text }))
                }
                placeholder="Etiketler (virgülle ayırın)"
                className={`p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}]`}
                placeholderTextColor={theme.colors.text.secondary(isDarkMode)}
              />
            </View>

            {/* Gönder Butonu */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`mt-6 p-4 rounded-xl ${
                loading
                  ? `bg-[${theme.colors.accent.primary}]/50`
                  : `bg-[${theme.colors.accent.primary}]`
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-rubik-medium">
                  Portfolyoya Ekle
                </Text>
              )}
            </Pressable>
          </ScrollView>
        ) : (
          <FlashList
            data={portfolioItems}
            renderItem={({ item }) => <PortfolioListItem item={item} />}
            estimatedItemSize={88}
            onRefresh={loadPortfolioItems}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
