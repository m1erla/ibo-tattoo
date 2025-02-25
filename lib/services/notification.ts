import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { databases, appwriteConfig, functions } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Gelişmiş bildirim tipleri
export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  NEW_MESSAGE = 'new_message',
  PAYMENT_RECEIVED = 'payment_received'
}

export const notificationService = {
  // Push token'ı kaydet
  registerForPushNotifications: async (userId: string) => {
    if (!Device.isDevice) {
      console.log("Fiziksel cihaz gerekli");
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Bildirim izni alınamadı!");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;

      // Token'ı Appwrite'a kaydet
      try {
        await databases.createDocument(
          appwriteConfig.databaseId!,
          appwriteConfig.pushTokensCollectionId!,
          ID.unique(),
          {
            userId,
            token,
            platform: Platform.OS,
            createdAt: new Date().toISOString(),
          }
        );
      } catch (error: any) {
        if (error.code !== 409) {
          console.error("Token kayıt hatası:", error);
        }
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0061FF",
        });
      }

      return token;
    } catch (error) {
      console.error("Push token kaydı hatası:", error);
    }
  },

  // Bildirim gönder
  sendPushNotification: async (userIds: string[], title: string, body: string) => {
    try {
      const response = await functions.createExecution(
        'send_push_notification', // Function ID'si
        JSON.stringify({
          userIds: Array.isArray(userIds) ? userIds : [userIds],
          title,
          body,
        })
      );

      if (!response) {
        throw new Error('Bildirim gönderilemedi');
      }

      return response;
    } catch (error) {
      console.error("Bildirim gönderme hatası:", error);
      throw error;
    }
  },

  // Farklı zamanlarda randevu hatırlatması için
  scheduleAppointmentReminders: async (appointmentId: string, appointmentDate: Date, userId: string) => {
    try {
      // Randevudan 1 gün önce hatırlatma
      const oneDayBefore = new Date(appointmentDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(10, 0, 0, 0);
      
      if (oneDayBefore > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Randevu Hatırlatması',
            body: `Yarın saat ${format(appointmentDate, 'HH:mm', { locale: tr })} için randevunuz var.`,
            data: { appointmentId, type: NotificationType.APPOINTMENT_REMINDER }
          },
          trigger: { date: oneDayBefore, type: 'date' as never },
        });
      }
      
      // Randevudan 3 saat önce hatırlatma
      const threeHoursBefore = new Date(appointmentDate);
      threeHoursBefore.setHours(threeHoursBefore.getHours() - 3);
      
      if (threeHoursBefore > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Randevu Yaklaşıyor',
            body: `Randevunuza 3 saat kaldı. Saat: ${format(appointmentDate, 'HH:mm', { locale: tr })}`,
            data: { appointmentId, type: NotificationType.APPOINTMENT_REMINDER }
          },
          trigger: { date: threeHoursBefore, type: 'date' as never },
        });
      }
      
      // Randevu bildirimleri veritabanına kaydetme
      await databases.createDocument(
        appwriteConfig.databaseId!,
        'notification_schedules',
        ID.unique(),
        {
          userId,
          appointmentId,
          scheduledTimes: [oneDayBefore.toISOString(), threeHoursBefore.toISOString()],
          createdAt: new Date().toISOString()
        }
      );
      
      return true;
    } catch (error) {
      console.error('Bildirim zamanlama hatası:', error);
      return false;
    }
  },
}; 