import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';

export default function Settings() {
  const { isDarkMode, theme } = useTheme();
  // Component implementasyonu
  return (
    <SafeAreaView>
      <Text>Ayarlar</Text>
    </SafeAreaView>
  );
}
