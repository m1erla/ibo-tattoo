import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID, Query } from 'react-native-appwrite';

export const favoritesService = {
  addToFavorites: async (userId: string, designId: string) => {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId!,
        'favorites',
        ID.unique(),
        {
          userId,
          designId,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Favori ekleme hatası:', error);
      throw error;
    }
  },

  getFavorites: async (userId: string) => {
    try {
      return await databases.listDocuments(
        appwriteConfig.databaseId!,
        'favorites',
        [Query.equal('userId', userId)]
      );
    } catch (error) {
      console.error('Favorileri getirme hatası:', error);
      throw error;
    }
  }
}; 