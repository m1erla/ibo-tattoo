import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { useLanguage } from '@/lib/services/language';
import { pricingService, PricingRules } from '@/lib/services/pricing';

export default function PricingManagement() {
  const { isDarkMode, theme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fiyat kuralları
  const [pricingRules, setPricingRules] = useState<PricingRules | null>(null);

  useEffect(() => {
    loadPricingRules();
  }, []);

  const loadPricingRules = async () => {
    try {
      setLoading(true);
      const rules = await pricingService.getPricingRules();
      setPricingRules(rules);
    } catch (error) {
      console.error('Fiyat kuralları yükleme hatası:', error);
      Alert.alert('Hata', 'Fiyat kuralları yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const savePricingRules = async () => {
    if (!pricingRules) return;

    try {
      setSaving(true);
      await pricingService.savePricingRules(pricingRules);
      Alert.alert('Başarılı', 'Fiyat kuralları kaydedildi');
    } catch (error) {
      console.error('Fiyat kuralları kaydetme hatası:', error);
      Alert.alert('Hata', 'Fiyat kuralları kaydedilirken bir sorun oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !pricingRules) {
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
          {t('admin.pricingManagement')}
        </Text>

        {/* Boyut Fiyatları */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-3`}
          >
            {t('admin.sizePricing')}
          </Text>

          {pricingRules.sizes.map((size, index) => (
            <View
              key={size.id}
              className={`flex-row items-center justify-between p-4 mb-2 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
            >
              <Text
                className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
              >
                {size.name}
              </Text>
              <View className="flex-row items-center">
                <TextInput
                  value={size.basePrice.toString()}
                  onChangeText={(text) => {
                    const newRules = { ...pricingRules };
                    newRules.sizes[index].basePrice = parseInt(text) || 0;
                    setPricingRules(newRules);
                  }}
                  keyboardType="numeric"
                  className={`p-2 mr-2 w-24 rounded-lg border border-[${theme.colors.border.primary(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}] text-right`}
                />
                <Text
                  className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
                >
                  ₺
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stil Çarpanları */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-3`}
          >
            {t('admin.styleMultipliers')}
          </Text>

          {pricingRules.styles.map((style, index) => (
            <View
              key={style.id}
              className={`flex-row items-center justify-between p-4 mb-2 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
            >
              <Text
                className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
              >
                {style.name}
              </Text>
              <View className="flex-row items-center">
                <TextInput
                  value={style.multiplier.toString()}
                  onChangeText={(text) => {
                    const newRules = { ...pricingRules };
                    newRules.styles[index].multiplier = parseFloat(text) || 1.0;
                    setPricingRules(newRules);
                  }}
                  keyboardType="numeric"
                  className={`p-2 mr-2 w-16 rounded-lg border border-[${theme.colors.border.primary(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}] text-right`}
                />
                <Text
                  className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
                >
                  x
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Yerleşim Çarpanları */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-3`}
          >
            {t('admin.placementMultipliers')}
          </Text>

          {pricingRules.placements.map((placement, index) => (
            <View
              key={placement.id}
              className={`flex-row items-center justify-between p-4 mb-2 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
            >
              <Text
                className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
              >
                {placement.name}
              </Text>
              <View className="flex-row items-center">
                <TextInput
                  value={placement.multiplier.toString()}
                  onChangeText={(text) => {
                    const newRules = { ...pricingRules };
                    newRules.placements[index].multiplier =
                      parseFloat(text) || 1.0;
                    setPricingRules(newRules);
                  }}
                  keyboardType="numeric"
                  className={`p-2 mr-2 w-16 rounded-lg border border-[${theme.colors.border.primary(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}] text-right`}
                />
                <Text
                  className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
                >
                  x
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Özel Teklifler */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-3`}
          >
            {t('admin.specialOffers')}
          </Text>

          {pricingRules.specialOffers.map((offer, index) => (
            <View
              key={offer.id}
              className={`flex-row items-center justify-between p-4 mb-2 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
            >
              <View>
                <Text
                  className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
                >
                  {offer.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <TextInput
                  value={offer.discount.toString()}
                  onChangeText={(text) => {
                    const newRules = { ...pricingRules };
                    newRules.specialOffers[index].discount =
                      parseInt(text) || 0;
                    setPricingRules(newRules);
                  }}
                  keyboardType="numeric"
                  className={`p-2 mr-2 w-16 rounded-lg border border-[${theme.colors.border.primary(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}] text-right`}
                />
                <Text
                  className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mr-4`}
                >
                  %
                </Text>
                <Switch
                  value={offer.active}
                  onValueChange={(value) => {
                    const newRules = { ...pricingRules };
                    newRules.specialOffers[index].active = value;
                    setPricingRules(newRules);
                  }}
                  trackColor={{
                    false: theme.colors.border.primary(isDarkMode),
                    true: theme.colors.accent.primary,
                  }}
                  thumbColor={isDarkMode ? '#FFFFFF' : '#F4F4F4'}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Depozit Ayarları */}
        <View className="mb-6">
          <Text
            className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}] mb-3`}
          >
            {t('admin.depositSettings')}
          </Text>

          <View
            className={`flex-row items-center justify-between p-4 mb-2 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
          >
            <Text
              className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
            >
              {t('admin.depositRequired')}
            </Text>
            <Switch
              value={pricingRules.depositRequired}
              onValueChange={(value) => {
                setPricingRules({
                  ...pricingRules,
                  depositRequired: value,
                });
              }}
              trackColor={{
                false: theme.colors.border.primary(isDarkMode),
                true: theme.colors.accent.primary,
              }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#F4F4F4'}
            />
          </View>

          <View
            className={`flex-row items-center justify-between p-4 mb-2 rounded-xl bg-[${theme.colors.card.background(isDarkMode)}]`}
          >
            <Text
              className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
            >
              {t('admin.depositPercentage')}
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={pricingRules.depositPercentage.toString()}
                onChangeText={(text) => {
                  setPricingRules({
                    ...pricingRules,
                    depositPercentage: parseInt(text) || 0,
                  });
                }}
                keyboardType="numeric"
                className={`p-2 mr-2 w-16 rounded-lg border border-[${theme.colors.border.primary(isDarkMode)}] text-[${theme.colors.text.primary(isDarkMode)}] text-right`}
              />
              <Text
                className={`font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
              >
                %
              </Text>
            </View>
          </View>
        </View>

        {/* Kaydet Butonu */}
        <Pressable
          onPress={savePricingRules}
          disabled={saving}
          className={`py-4 rounded-xl ${
            saving
              ? `bg-[${theme.colors.accent.primary}]/50`
              : `bg-[${theme.colors.accent.primary}]`
          }`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-rubik-medium">
              {t('common.save')}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
