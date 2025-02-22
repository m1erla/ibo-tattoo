import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID, Query } from 'react-native-appwrite';

interface ReviewData {
  userId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export const reviewsService = {
  create: async (data: ReviewData) => {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId!,
        'reviews',
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('İnceleme oluşturma hatası:', error);
      throw error;
    }
  },

  getAppointmentReviews: async (appointmentId: string) => {
    try {
      return await databases.listDocuments(
        appwriteConfig.databaseId!,
        'reviews',
        [Query.equal('appointmentId', appointmentId)]
      );
    } catch (error) {
      console.error('İncelemeleri getirme hatası:', error);
      throw error;
    }
  }
}; 