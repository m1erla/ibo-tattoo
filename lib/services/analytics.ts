import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const analyticsService = {
  getMonthlyRevenue: async () => {
    try {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());

      const appointments = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        [
          Query.greaterThanEqual('dateTime', start.toISOString()),
          Query.lessThanEqual('dateTime', end.toISOString()),
          Query.equal('status', 'completed')
        ]
      );

      return appointments.documents.reduce((total, appointment) => {
        return total + appointment.price;
      }, 0);
    } catch (error) {
      console.error('Gelir analizi hatası:', error);
      throw error;
    }
  },

  getCustomerDemographics: async () => {
    try {
      const appointments = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!
      );

      const demographics = appointments.documents.reduce((acc, appointment) => {
        const style = appointment.designDetails.style;
        acc[style] = (acc[style] || 0) + 1;
        return acc;
      }, {});

      return demographics;
    } catch (error) {
      console.error('Demografik analiz hatası:', error);
      throw error;
    }
  }
}; 