import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { databases, appwriteConfig } from '@/lib/appwrite';
import Slider from '@react-native-community/slider';
import { useGlobalContext } from '@/lib/global-provider';
import { pricingService } from '@/lib/services/pricing';

const TATTOO_SIZES = ['Küçük', 'Orta', 'Büyük', 'Çok Büyük'];
const TATTOO_STYLES = ['Minimal', 'Realistik', 'Traditional', 'Tribal'];
const BODY_PARTS = ['Kol', 'Bacak', 'Sırt', 'Göğüs', 'Bilek'];

export default function PriceCalculator() {
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [priceRules, setPriceRules] = useState<any>(null);

  // Seçim durumları
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState('');
  const [complexity, setComplexity] = useState(50); // 0-100 arası karmaşıklık seviyesi

  // Hesaplanan fiyat
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [deposit, setDeposit] = useState<number | null>(null);

  useEffect(() => {
    loadPricingRules();
  }, []);

  useEffect(() => {
    if (priceRules && selectedSize && selectedStyle && selectedPlacement) {
      calculatePrice();
    } else {
      setCalculatedPrice(null);
      setDeposit(null);
    }
  }, [priceRules, selectedSize, selectedStyle, selectedPlacement, complexity]);

  const loadPricingRules = async () => {
    try {
      setLoading(true);
      const rules = await pricingService.getPricingRules();
      setPriceRules(rules);
    } catch (error) {
      console.error('Fiyat kuralları yükleme hatası:', error);
      Alert.alert('Hata', 'Fiyat bilgileri yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!priceRules) return;

    // Temel fiyat
    const sizeObj = priceRules.sizes.find((s: any) => s.name === selectedSize);
    const styleObj = priceRules.styles.find(
      (s: any) => s.name === selectedStyle
    );
    const placementObj = priceRules.placements.find(
      (p: any) => p.name === selectedPlacement
    );

    if (!sizeObj || !styleObj || !placementObj) return;

    // Temel hesaplama
    let price = sizeObj.basePrice;
    price *= styleObj.multiplier;
    price *= placementObj.multiplier;

    // Karmaşıklık faktörü (complexity)
    const complexityFactor = 1 + (complexity - 50) / 100;
    price *= complexityFactor;

    // Yuvarlama
    price = Math.round(price / 10) * 10;

    setCalculatedPrice(price);

    // Depozito hesaplama
    if (priceRules.depositRequired) {
      setDeposit(Math.round(price * (priceRules.depositPercentage / 100)));
    } else {
      setDeposit(null);
    }
  };

  const handleCreateAppointment = () => {
    if (!user) {
      Alert.alert(
        'Giriş Yapın',
        'Randevu oluşturmak için giriş yapmalısınız.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => router.push('/sign-in') },
        ]
      );
      return;
    }

    if (!calculatedPrice) {
      Alert.alert('Hata', 'Lütfen önce fiyat hesaplatın.');
      return;
    }

    // Tasarım detaylarını iletelim
    router.push({
      pathname: '/create-appointment',
      params: {
        size: selectedSize,
        style: selectedStyle,
        placement: selectedPlacement,
        complexity: complexity.toString(),
        price: calculatedPrice.toString(),
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={theme.colors.accent.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          Fiyat Hesaplama
        </Text>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="mb-6 p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]"
        >
          <Text
            className={`text-[${theme.colors.text.secondary(isDarkMode)}] mb-4`}
          >
            Dövme boyutu, stili ve yerleşimi seçerek yaklaşık bir fiyat
            hesaplayabilirsiniz.
          </Text>

          {/* Boyut Seçimi */}
          <View className="mb-4">
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
            >
              Boyut
            </Text>
            <View className="flex-row flex-wrap">
              {TATTOO_SIZES.map((size) => (
                <Pressable
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                    selectedSize === size
                      ? `bg-[${theme.colors.accent.primary}]`
                      : `bg-[${theme.colors.background.secondary(isDarkMode)}]`
                  }`}
                >
                  <Text
                    className={`${
                      selectedSize === size
                        ? 'text-white'
                        : `text-[${theme.colors.text.primary(isDarkMode)}]`
                    }`}
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Stil Seçimi */}
          <View className="mb-4">
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
            >
              Stil
            </Text>
            <View className="flex-row flex-wrap">
              {TATTOO_STYLES.map((style) => (
                <Pressable
                  key={style}
                  onPress={() => setSelectedStyle(style)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                    selectedStyle === style
                      ? `bg-[${theme.colors.accent.primary}]`
                      : `bg-[${theme.colors.background.secondary(isDarkMode)}]`
                  }`}
                >
                  <Text
                    className={`${
                      selectedStyle === style
                        ? 'text-white'
                        : `text-[${theme.colors.text.primary(isDarkMode)}]`
                    }`}
                  >
                    {style}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Yerleşim Seçimi */}
          <View className="mb-4">
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
            >
              Yerleşim
            </Text>
            <View className="flex-row flex-wrap">
              {BODY_PARTS.map((part) => (
                <Pressable
                  key={part}
                  onPress={() => setSelectedPlacement(part)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                    selectedPlacement === part
                      ? `bg-[${theme.colors.accent.primary}]`
                      : `bg-[${theme.colors.background.secondary(isDarkMode)}]`
                  }`}
                >
                  <Text
                    className={`${
                      selectedPlacement === part
                        ? 'text-white'
                        : `text-[${theme.colors.text.primary(isDarkMode)}]`
                    }`}
                  >
                    {part}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Karmaşıklık Seviyesi */}
          <View className="mb-4">
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
            >
              Karmaşıklık Seviyesi: {complexity}%
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={complexity}
              onValueChange={setComplexity}
              minimumTrackTintColor={theme.colors.accent.primary}
              maximumTrackTintColor={theme.colors.border.primary(isDarkMode)}
              thumbTintColor={theme.colors.accent.primary}
            />
            <View className="flex-row justify-between">
              <Text
                className={`text-[${theme.colors.text.secondary(isDarkMode)}]`}
              >
                Basit
              </Text>
              <Text
                className={`text-[${theme.colors.text.secondary(isDarkMode)}]`}
              >
                Karmaşık
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Fiyat Gösterimi */}
        {calculatedPrice && (
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="mb-6 p-6 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]"
          >
            <Text
              className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-2`}
            >
              Tahmini Fiyat
            </Text>
            <Text
              className={`text-3xl font-rubik-bold text-[${theme.colors.accent.primary}]`}
            >
              {calculatedPrice.toLocaleString('tr-TR')} ₺
            </Text>

            {deposit && (
              <View className="mt-4 p-3 rounded-lg bg-[${theme.colors.background.secondary(isDarkMode)}]">
                <Text
                  className={`text-sm text-[${theme.colors.text.secondary(isDarkMode)}]`}
                >
                  Depozito Tutarı: {deposit.toLocaleString('tr-TR')} ₺
                </Text>
                <Text
                  className={`text-xs mt-1 text-[${theme.colors.text.tertiary(isDarkMode)}]`}
                >
                  Randevu onayı için depozito gereklidir.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Eylem Butonları */}
        <View className="flex-row space-x-3 mt-4">
          <Pressable
            onPress={() => router.back()}
            className={`flex-1 p-4 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
          >
            <Text
              className={`text-center font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
            >
              Geri
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCreateAppointment}
            disabled={!calculatedPrice}
            className={`flex-1 p-4 rounded-xl ${
              !calculatedPrice
                ? `bg-[${theme.colors.accent.primary}]/50`
                : `bg-[${theme.colors.accent.primary}]`
            }`}
          >
            <Text className="text-white text-center font-rubik-medium">
              Randevu Oluştur
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
