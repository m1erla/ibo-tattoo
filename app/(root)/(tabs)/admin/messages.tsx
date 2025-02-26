import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme-provider';
import { useLanguage } from '@/lib/services/language';
import { messageService, Conversation } from '@/lib/services/message';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function MessagesCenter() {
  const { isDarkMode, theme } = useTheme();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response as any);
    } catch (error) {
      console.error('Mesaj yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mesaj gönderme
  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      await messageService.sendMessage(selectedConversation.id, message);
      setMessage('');
      // Mesajları yeniden yükle
      loadConversations();
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
      style={{ paddingBottom: 70 }}
    >
      <View className="flex-1 p-4">
        <Text
          className={`text-2xl font-rubik-semibold text-[${theme.colors.text.primary(isDarkMode)}] mb-6`}
        >
          {t('admin.messagesCenter')}
        </Text>

        {/* Mesajlaşma arayüzü */}
      </View>
    </SafeAreaView>
  );
}
