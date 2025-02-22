import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { paymentService } from '@/lib/services/payment';

export default function Payments() {
  const { isDarkMode, theme } = useTheme();
  // Component implementasyonu
  return (
    <SafeAreaView>
      <Text>Ödeme Yönetimi</Text>
    </SafeAreaView>
  );
}
