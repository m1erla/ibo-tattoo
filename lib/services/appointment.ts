import { databases, appwriteConfig } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { Query } from "react-native-appwrite";
import { notificationService } from "./notification";
import { format, addHours, isBefore } from "date-fns";
import { tr } from "date-fns/locale";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface CreateAppointmentDTO {
  clientId: string;
  dateTime: string;
  designDetails: {
    size: string;
    style: string;
    placement: string;
  };
  notes?: string;
  price?: number;
  status: AppointmentStatus;
}

export const appointmentService = {
  // Randevu oluşturma
  create: async (data: CreateAppointmentDTO) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        ID.unique(),
        {
          clientId: data.clientId,
          dateTime: data.dateTime,
          designDetails: JSON.stringify(data.designDetails),
          notes: data.notes || "",
          price: calculatePrice(data.designDetails),
          status: "pending",
          createdAt: new Date(),
        }
      );

      // Admin'lere bildirim gönder
      try {
        // Admin kullanıcıları bul
        const adminUsers = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.userCollectionId!,
          [Query.equal("role", "admin")]
        );

        // Müşteri bilgilerini al
        const client = await databases.getDocument(
          appwriteConfig.databaseId!,
          appwriteConfig.userCollectionId!,
          data.clientId
        );

        const designDetails = JSON.parse(response.designDetails);
        const price = calculatePrice(designDetails);

        const notificationMessage = 
          `${format(new Date(data.dateTime), "d MMMM yyyy HH:mm", { locale: tr })}\n` +
          `Müşteri: ${client.name}\n` +
          `Dövme: ${designDetails.style} - ${designDetails.size}\n` +
          `Bölge: ${designDetails.placement}\n` +
          `Fiyat: ${price} TL`;

        const adminIds = adminUsers.documents.map(admin => admin.$id);

        if (adminIds.length > 0) {
          await notificationService.sendPushNotification(
            adminIds,
            "Yeni Randevu Talebi",
            notificationMessage
          );
        }
      } catch (error) {
        console.error("Admin bildirimi gönderilemedi:", error);
      }

      return response;
    } catch (error) {
      console.error("Randevu oluşturma hatası:", error);
      throw error;
    }
  },

  // Randevu güncelleme
  update: async (appointmentId: string, data: Partial<CreateAppointmentDTO>) => {
    try {
      const updateData = {
        ...data,
        ...(data.designDetails && {
          designDetails: JSON.stringify(data.designDetails),
        }),
      };

      const response = await databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        appointmentId,
        updateData
      );

      // Bildirim gönder
      if (data.status) {
        const appointment = await databases.getDocument(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          appointmentId
        );

        const designDetails = JSON.parse(appointment.designDetails);
        const dateStr = format(
          new Date(appointment.dateTime),
          "d MMMM yyyy HH:mm",
          { locale: tr }
        );

        let message = "";
        if (data.status === "confirmed") {
          message = 
            `Randevunuz onaylandı!\n` +
            `Tarih: ${dateStr}\n` +
            `Dövme: ${designDetails.style} - ${designDetails.size}\n` +
            `Bölge: ${designDetails.placement}\n` +
            `Fiyat: ${appointment.price} TL\n\n` +
            `Görüşmek üzere!`;
        } else {
          message = 
            `Randevunuz reddedildi.\n` +
            `Tarih: ${dateStr}\n` +
            `Lütfen yeni bir randevu oluşturun.`;
        }

        await notificationService.sendPushNotification(
          [appointment.clientId],
          "Randevu Durumu",
          message
        );
      }

      return response;
    } catch (error) {
      console.error("Randevu güncelleme hatası:", error);
      throw error;
    }
  },

  // Randevu silme
  delete: async (appointmentId: string) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        appointmentId
      );
      return true;
    } catch (error) {
      console.error("Randevu silme hatası:", error);
      throw error;
    }
  },

  // Randevu listesi
  list: async (queries: any[] = []) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        queries
      );
      return response;
    } catch (error) {
      console.error("Randevu listesi hatası:", error);
      throw error;
    }
  },

  // Belirli bir tarih için müsait zaman dilimlerini getir
  getAvailableTimeSlots: async (date: string) => {
    try {
      // O gün için olan tüm randevuları getir
      const response = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        [
          Query.greaterThanEqual("dateTime", `${date}T00:00:00.000Z`),
          Query.lessThan("dateTime", `${date}T23:59:59.999Z`),
          Query.notEqual("status", "cancelled"),
        ]
      );

      // Dolu zaman dilimlerini bul
      const bookedSlots = response.documents.map((doc) => {
        const dateTime = new Date(doc.dateTime);
        return `${dateTime.getHours().toString().padStart(2, "0")}:${dateTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      });

      // Tüm zaman dilimleri (10:00-18:00 arası, 1 saat aralıklarla)
      const ALL_TIME_SLOTS = [
        "10:00",
        "11:00",
        "12:00",
        "14:00", // Öğle arası 13:00
        "15:00",
        "16:00",
        "17:00",
      ];

      // Müsait zaman dilimlerini hesapla
      const availableSlots = ALL_TIME_SLOTS.filter(
        (slot) => !bookedSlots.includes(slot)
      );

      return availableSlots;
    } catch (error) {
      console.error("Müsait zaman dilimleri getirme hatası:", error);
      throw error;
    }
  },

  // Randevu İptali
  cancel: async (appointmentId: string, reason: string) => {
    try {
      const appointment = await databases.getDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        appointmentId
      );

      const updatedAppointment = await databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        appointmentId,
        {
          status: "cancelled",
          cancellationReason: reason,
          updatedAt: new Date(),
        }
      );

      // Müşteriye iptal bildirimi gönder
      await notificationService.sendPushNotification(
        [appointment.clientId],
        "Randevu İptali",
        `${format(new Date(appointment.dateTime), "d MMMM yyyy HH:mm", { locale: tr })} tarihli randevunuz iptal edildi.`
      );

      return updatedAppointment;
    } catch (error) {
      console.error("Randevu iptal hatası:", error);
      throw error;
    }
  },

  // Randevu Yeniden Planlama
  reschedule: async (appointmentId: string, newDateTime: string) => {
    try {
      const appointment = await databases.getDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        appointmentId
      );

      // Seçilen saatin müsait olup olmadığını kontrol et
      const existingAppointments = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        [
          Query.equal("dateTime", newDateTime),
          Query.notEqual("status", "cancelled"),
        ]
      );

      if (existingAppointments.total > 0) {
        throw new Error("Seçilen saat dolu");
      }

      const updatedAppointment = await databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        appointmentId,
        {
          dateTime: newDateTime,
          status: "confirmed",
          updatedAt: new Date(),
        }
      );

      // Müşteriye bildirim gönder
      await notificationService.sendPushNotification(
        [appointment.clientId],
        "Randevu Güncellendi",
        `Randevunuz ${format(new Date(newDateTime), "d MMMM yyyy HH:mm", { locale: tr })} tarihine alındı.`
      );

      return updatedAppointment;
    } catch (error) {
      console.error("Randevu güncelleme hatası:", error);
      throw error;
    }
  },

  // Randevu Hatırlatıcıları
  scheduleReminders: async (appointmentId: string) => {
    try {
      const appointment = await databases.getDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        appointmentId
      );

      const appointmentDate = new Date(appointment.dateTime);
      const now = new Date();

      // 24 saat kala hatırlatma
      const dayBefore = addHours(appointmentDate, -24);
      if (isBefore(now, dayBefore)) {
        setTimeout(async () => {
          await notificationService.sendPushNotification(
            [appointment.clientId],
            "Randevu Hatırlatması",
            `Yarın saat ${format(appointmentDate, "HH:mm", { locale: tr })} randevunuz var.`
          );
        }, dayBefore.getTime() - now.getTime());
      }

      // 1 saat kala hatırlatma
      const hourBefore = addHours(appointmentDate, -1);
      if (isBefore(now, hourBefore)) {
        setTimeout(async () => {
          await notificationService.sendPushNotification(
            [appointment.clientId],
            "Randevu Hatırlatması",
            `1 saat sonra randevunuz var.`
          );
        }, hourBefore.getTime() - now.getTime());
      }
    } catch (error) {
      console.error("Hatırlatıcı planlama hatası:", error);
    }
  },

  // Saat dilimi ayarlaması ile randevu oluşturma
  createWithTimezone: async (data: CreateAppointmentDTO) => {
    try {
      // Kullanıcının yerel saat dilimini al
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Tarihi UTC'ye çevir
      const localDate = new Date(data.dateTime);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      const response = await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.appointmentsCollectionId!,
        ID.unique(),
        {
          ...data,
          dateTime: utcDate.toISOString(),
          timezone: userTimezone,
          createdAt: new Date(),
        }
      );

      // Hatırlatıcıları planla
      await appointmentService.scheduleReminders(response.$id);

      return response;
    } catch (error) {
      console.error("Randevu oluşturma hatası:", error);
      throw error;
    }
  },
};

// Fiyat hesaplama fonksiyonu
const calculatePrice = (designDetails: { size: string; style: string }) => {
  let basePrice = 0;

  // Boyuta göre fiyat
  switch (designDetails.size) {
    case "Küçük":
      basePrice = 500;
      break;
    case "Orta":
      basePrice = 1000;
      break;
    case "Büyük":
      basePrice = 2000;
      break;
    case "Çok Büyük":
      basePrice = 3000;
      break;
    default:
      basePrice = 500;
  }

  // Stile göre ek fiyat
  switch (designDetails.style) {
    case "Realistik":
      basePrice *= 1.5;
      break;
    case "Traditional":
      basePrice *= 1.3;
      break;
    case "Tribal":
      basePrice *= 1.2;
      break;
    default:
      break;
  }

  return Math.round(basePrice);
}; 