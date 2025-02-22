import { databases, storage, appwriteConfig } from '@/lib/appwrite';
import { ID, Query, ImageGravity, Models } from 'react-native-appwrite';

interface ImageUpload {
  name: string;
  type: string;
  size: number;
  uri: string;
}

interface PortfolioItemData {
  imageFile: ImageUpload;
  category: string;
  style: string;
  size: string;
  description: string;
  tags: string[];
  beforeImage?: ImageUpload;
}

export interface PortfolioItem extends Models.Document {
  imageUrl: string;
  beforeImageUrl?: string;
  category: string;
  style: string;
  size: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export const portfolioService = {
  // Portfolyo öğesi ekleme
  addItem: async (data: PortfolioItemData) => {
    try {
      const imageId = ID.unique();
      const response = await fetch(data.imageFile.uri);
      const blob = await response.blob();
      
      const afterImage = await storage.createFile(
        appwriteConfig.storageBucketId!,
        imageId,
        {
          name: data.imageFile.name,
          type: data.imageFile.type,
          size: data.imageFile.size,
          uri: data.imageFile.uri
        }
      );

      let beforeImageId;
      if (data.beforeImage) {
        beforeImageId = ID.unique();
        const beforeResponse = await fetch(data.beforeImage.uri);
        const beforeBlob = await beforeResponse.blob();
        
        await storage.createFile(
          appwriteConfig.storageBucketId!,
          beforeImageId,
          {
            name: data.beforeImage.name,
            type: data.beforeImage.type,
            size: data.beforeImage.size,
            uri: data.beforeImage.uri
          }
        );
      }

      // Portfolyo öğesini oluştur
      return await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.portfolioCollectionId!,
        ID.unique(),
        {
          ...data,
          imageUrl: storage.getFilePreview(
            appwriteConfig.storageBucketId!,
            imageId
          ).toString(),
          beforeImageUrl: beforeImageId
            ? storage.getFilePreview(
                appwriteConfig.storageBucketId!,
                beforeImageId
              ).toString()
            : null,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Portfolyo öğesi ekleme hatası:', error);
      throw error;
    }
  },

  // Yüksek çözünürlüklü resim URL'i al
  getHighResImageUrl: (fileId: string) => {
    try {
      return storage.getFilePreview(
        appwriteConfig.storageBucketId!,
        fileId,
        2048, // width
        2048, // height
        ImageGravity.Center, // gravity
        100 // quality
      ).toString();
    } catch (error) {
      console.error('Yüksek çözünürlüklü resim URL alma hatası:', error);
      throw error;
    }
  },

  // Portfolyo listesini getir
  list: async (page: number = 1, filters?: {
    category?: string;
    style?: string;
    size?: string;
  }) => {
    try {
      const queries: any[] = [
        Query.orderDesc('createdAt'),
        Query.limit(10),
        Query.offset((page - 1) * 10)
      ];

      if (filters?.category && filters.category !== 'Tümü') {
        queries.push(Query.equal('category', filters.category));
      }
      if (filters?.style && filters.style !== 'Tümü') {
        queries.push(Query.equal('style', filters.style));
      }
      if (filters?.size && filters.size !== 'Tümü') {
        queries.push(Query.equal('size', filters.size));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.portfolioCollectionId!,
        queries
      );

      const validDocuments = response.documents.filter(doc => doc.$id);
      
      return {
        ...response,
        documents: validDocuments.map(doc => ({
          ...doc,
          $id: doc.$id || ID.unique()
        }))
      };
    } catch (error) {
      console.error('Portfolyo listesi getirme hatası:', error);
      throw error;
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.portfolioCollectionId!,
        itemId
      );
      return true;
    } catch (error) {
      console.error('Portfolyo öğesi silme hatası:', error);
      throw error;
    }
  },

  getItemById: async (itemId: string) => {
    try {
      if (!itemId) {
        throw new Error('Geçersiz ID parametresi');
      }

      const document = await databases.getDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.portfolioCollectionId!,
        itemId
      );

      if (!document) {
        throw new Error('Portfolyo öğesi bulunamadı');
      }

      return document;
    } catch (error) {
      console.error('Portfolyo öğesi getirme hatası:', error);
      throw error;
    }
  },
}; 