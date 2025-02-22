import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { appointmentService } from '@/lib/services/appointment';

export default function AppointmentsManagement() {
  const { isDarkMode, theme } = useTheme();
  // Component implementasyonu
  return (
    <SafeAreaView>
      <Text>Randevu Yönetimi</Text>
    </SafeAreaView>
  );
}
