import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { Query } from "react-native-appwrite";

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
      await databases.createDocument(
        appwriteConfig.databaseId!,
        "push_tokens", // Yeni koleksiyon oluşturun
        ID.unique(),
        {
          userId,
          token,
          platform: Platform.OS,
          createdAt: new Date(),
        }
      );

      // Android için ek kanal ayarları
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
      // Kullanıcıların token'larını al
      const tokens = await databases.listDocuments(
        appwriteConfig.databaseId!,
        "push_tokens",
        [Query.equal("userId", userIds)]
      );

      // Her token için bildirim gönder
      tokens.documents.forEach(async (doc) => {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: doc.token,
            sound: "default",
            title,
            body,
            data: { someData: "goes here" },
          }),
        });
      });
    } catch (error) {
      console.error("Bildirim gönderme hatası:", error);
    }
  },
}; 