import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';

export interface Client {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  name: string;
  email: string;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  role: 'admin' | 'client';
  notes?: string;
  phone?: string;
  appointmentCount?: number;
  totalSpent?: number;
  preferences?: {
    favoriteStyles?: string[];
    specialRequirements?: string;
  };
}

export const clientService = {
  list: async (page: number = 1, search: string = '') => {
    try {
      const queries: string[] = [
        Query.orderDesc('$createdAt'),
        Query.limit(20),
        Query.offset((page - 1) * 20),
        Query.equal('role', 'client'),
      ];

      if (search) {
        queries.push(Query.search('name', search));
      }

      return await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.userCollectionId!,
        queries
      );
    } catch (error) {
      console.error('Client list error:', error);
      throw error;
    }
  },

  updateStatus: async (clientId: string, status: Client['status']) => {
    try {
      return await databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.userCollectionId!,
        clientId,
        {
          status,
        }
      );
    } catch (error) {
      console.error('Status update error:', error);
      throw error;
    }
  },

  getClientDetails: async (clientId: string) => {
    try {
      return await databases.getDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.userCollectionId!,
        clientId
      );
    } catch (error) {
      console.error('Client details error:', error);
      throw error;
    }
  },

  updateNotes: async (clientId: string, notes: string) => {
    try {
      return await databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.userCollectionId!,
        clientId,
        { notes }
      );
    } catch (error) {
      console.error('Notes update error:', error);
      throw error;
    }
  },
}; 