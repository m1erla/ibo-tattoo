import { Query } from "react-native-appwrite";
import { ID } from "react-native-appwrite";
import { appwriteConfig, databases } from "../appwrite";

export const messagingService = {
  sendMessage: async (data: {
    senderId: string;
    receiverId: string;
    content: string;
    type: 'text' | 'image';
  }) => {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId!,
        'messages',
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  },

  getConversation: async (userId1: string, userId2: string) => {
    try {
      return await databases.listDocuments(
        appwriteConfig.databaseId!,
        'messages',
        [
          Query.equal('senderId', [userId1, userId2]),
          Query.equal('receiverId', [userId1, userId2]),
          Query.orderDesc('createdAt')
        ]
      );
    } catch (error) {
      console.error('Konuşma getirme hatası:', error);
      throw error;
    }
  }
}; 