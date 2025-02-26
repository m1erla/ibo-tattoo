import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID, Query } from 'react-native-appwrite';
import { useGlobalContext } from '@/lib/global-provider';

export interface Message {
  $id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

export const messageService = {
  // Tüm konuşmaları getir
  getConversations: async () => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId!,
        'conversations',
        [Query.orderDesc('lastMessageDate')]
      );
      return response.documents;
    } catch (error) {
      console.error('Konuşmaları getirme hatası:', error);
      throw error;
    }
  },

  // Mesaj gönder
  sendMessage: async (conversationId: string, content: string) => {
    try {
      const { user } = useGlobalContext();
      
      const message = await databases.createDocument(
        appwriteConfig.databaseId!,
        'messages',
        ID.unique(),
        {
          content,
          conversationId,
          senderId: user?.$id,
          createdAt: new Date().toISOString(),
          read: false,
        }
      );
      
      // Konuşmayı güncelle
      await databases.updateDocument(
        appwriteConfig.databaseId!,
        'conversations',
        conversationId,
        {
          lastMessage: content,
          lastMessageDate: new Date().toISOString(),
        }
      );
      
      return message;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  }
}; 