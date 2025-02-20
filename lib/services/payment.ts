import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID } from 'react-native-appwrite';
import { stripe } from '@/lib/stripe';

export const paymentService = {
  createDeposit: async (appointmentId: string, amount: number) => {
    try {
      const deposit = await databases.createDocument(
        appwriteConfig.databaseId!,
        'deposits',
        ID.unique(),
        {
          appointmentId,
          amount,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      );

      // Stripe entegrasyonu için örnek
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Kuruş cinsinden
        currency: 'try',
        payment_method_types: ['card'],
        metadata: {
          appointmentId,
          depositId: deposit.$id
        }
      });

      return {
        deposit,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Depozito oluşturma hatası:', error);
      throw error;
    }
  },

  confirmDeposit: async (depositId: string) => {
    try {
      return await databases.updateDocument(
        appwriteConfig.databaseId!,
        'deposits',
        depositId,
        {
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Depozito onaylama hatası:', error);
      throw error;
    }
  }
}; 