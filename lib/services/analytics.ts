import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr, enUS, de, nl } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dil localleri için bir mapping
const dateLocales: Record<string, Locale> = {
  tr,
  en: enUS,
  de,
  nl,
};

// Kullanıcının mevcut dilini alma fonksiyonu
const getCurrentLocale = async () => {
  try {
    const lang = await AsyncStorage.getItem('userLanguage') || 'tr';
    return dateLocales[lang] || tr;
  } catch (error) {
    console.error('Dil bilgisi alınamadı:', error);
    return tr;
  }
};

export interface MonthlyStats {
  revenue: number;
  appointments: number;
  newClients: number;
  averageRating: number;
}

export interface DashboardStats {
  totalAppointments: number;
  monthlyRevenue: number;
  activeClients: number;
  pendingAppointments: number;
}

export const analyticsService = {
  // Aylık istatistikler
  getMonthlyStats: async (monthsAgo: number = 0): Promise<MonthlyStats> => {
    try {
      const targetMonth = subMonths(new Date(), monthsAgo);
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);

      const [appointments, clients] = await Promise.all([
        // Randevuları getir
        databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          [
            Query.greaterThanEqual('dateTime', start.toISOString()),
            Query.lessThanEqual('dateTime', end.toISOString()),
          ]
        ),
        // Yeni müşterileri getir
        databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.userCollectionId!,
          [
            Query.greaterThanEqual('createdAt', start.toISOString()),
            Query.lessThanEqual('createdAt', end.toISOString()),
          ]
        ),
      ]);

      const revenue = appointments.documents.reduce(
        (sum, app) => sum + (app.price || 0),
        0
      );

      const ratings = appointments.documents
        .filter(app => app.rating)
        .map(app => app.rating);

      return {
        revenue,
        appointments: appointments.documents.length,
        newClients: clients.documents.length,
        averageRating: ratings.length
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0,
      };
    } catch (error) {
      console.error('İstatistik getirme hatası:', error);
      throw error;
    }
  },

  // Popüler dövme stilleri
  getPopularStyles: async () => {
    try {
      const appointments = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        [Query.limit(100)]
      );

      const styles = appointments.documents.reduce((acc, app) => {
        const style = JSON.parse(app.designDetails).style;
        acc[style] = (acc[style] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(styles)
        .map(([style, count]) => ({ style, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Popüler stiller getirme hatası:', error);
      throw error;
    }
  },

  // Müşteri demografisi
  getClientDemographics: async () => {
    try {
      const clients = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.userCollectionId!,
        [Query.equal('role', 'client')]
      );

      const demographics = clients.documents.reduce(
        (acc, client) => {
          if (client.age) {
            const ageGroup = Math.floor(client.age / 10) * 10;
            acc.ageGroups[`${ageGroup}-${ageGroup + 9}`] =
              (acc.ageGroups[`${ageGroup}-${ageGroup + 9}`] || 0) + 1;
          }
          if (client.gender) {
            acc.gender[client.gender] = (acc.gender[client.gender] || 0) + 1;
          }
          return acc;
        },
        { ageGroups: {}, gender: {} } as Record<string, Record<string, number>>
      );

      return demographics;
    } catch (error) {
      console.error('Demografik veri getirme hatası:', error);
      throw error;
    }
  },

  // Son 6 ayın randevu dağılımını getir
  getLast6MonthsAppointments: async () => {
    try {
      const today = new Date();
      const labels = [];
      const data = [];
      
      // Kullanıcının mevcut dilini al
      const currentLocale = await getCurrentLocale();
      
      // Son 6 ay için döngü
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthLabel = format(monthDate, 'MMM', { locale: currentLocale });
        labels.push(monthLabel);
        
        const startOfMonthDate = startOfMonth(monthDate);
        const endOfMonthDate = endOfMonth(monthDate);
        
        // Bu ay için randevuları getir
        const appointments = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          [
            Query.greaterThanEqual('dateTime', startOfMonthDate.toISOString()),
            Query.lessThanEqual('dateTime', endOfMonthDate.toISOString())
          ]
        );
        
        data.push(appointments.documents.length);
      }
      
      return { labels, data };
    } catch (error) {
      console.error('Son 6 ay randevu verisi getirme hatası:', error);
      return { labels: [], data: [] };
    }
  },

  // Dashboard özet istatistikleri için yeni metod
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Toplam randevu sayısı
      const appointments = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        []
      );
      
      // Bekleyen randevular
      const pendingAppointments = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        [Query.equal('status', 'pending')]
      );
      
      // Aktif müşteriler
      const activeClients = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.userCollectionId!,
        [Query.equal('status', 'active')]
      );
      
      // Bu ayki gelir
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const completedAppointments = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        [
          Query.equal('status', 'completed'),
          Query.greaterThanEqual('dateTime', firstDay.toISOString()),
          Query.lessThanEqual('dateTime', lastDay.toISOString())
        ]
      );
      
      const monthlyRevenue = completedAppointments.documents.reduce(
        (sum, appointment) => sum + (appointment.price || 0), 
        0
      );
      
      return {
        totalAppointments: appointments.total,
        monthlyRevenue,
        activeClients: activeClients.total,
        pendingAppointments: pendingAppointments.total
      };
    } catch (error) {
      console.error('Dashboard istatistikleri getirme hatası:', error);
      return {
        totalAppointments: 0,
        monthlyRevenue: 0,
        activeClients: 0,
        pendingAppointments: 0
      };
    }
  }
}; 