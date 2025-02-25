import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID } from 'react-native-appwrite';

interface PricingSize {
  id: string;
  name: string;
  basePrice: number;
}

interface PricingStyle {
  id: string;
  name: string;
  multiplier: number;
}

interface PricingPlacement {
  id: string;
  name: string;
  multiplier: number;
}

interface SpecialOffer {
  id: string;
  name: string;
  discount: number;
  active: boolean;
}

export interface PricingRules {
  sizes: PricingSize[];
  styles: PricingStyle[];
  placements: PricingPlacement[];
  specialOffers: SpecialOffer[];
  depositRequired: boolean;
  depositPercentage: number;
}

export const pricingService = {
  // Fiyat kurallarını al
  getPricingRules: async (): Promise<PricingRules> => {
    try {
      const pricingDoc = await databases.getDocument(
        appwriteConfig.databaseId!,
        'settings',
        'pricing_settings'
      ).catch(() => null);
      
      if (pricingDoc && pricingDoc.value) {
        return JSON.parse(pricingDoc.value);
      }
      
      // Varsayılan fiyat kuralları
      return {
        sizes: [
          { id: 'small', name: 'Küçük', basePrice: 500 },
          { id: 'medium', name: 'Orta', basePrice: 1000 },
          { id: 'large', name: 'Büyük', basePrice: 2000 },
          { id: 'xlarge', name: 'Çok Büyük', basePrice: 3000 },
        ],
        styles: [
          { id: 'minimal', name: 'Minimal', multiplier: 1.0 },
          { id: 'realistic', name: 'Realistik', multiplier: 1.5 },
          { id: 'traditional', name: 'Traditional', multiplier: 1.3 },
          { id: 'tribal', name: 'Tribal', multiplier: 1.2 },
        ],
        placements: [
          { id: 'arm', name: 'Kol', multiplier: 1.0 },
          { id: 'leg', name: 'Bacak', multiplier: 1.0 },
          { id: 'back', name: 'Sırt', multiplier: 1.2 },
          { id: 'chest', name: 'Göğüs', multiplier: 1.3 },
          { id: 'wrist', name: 'Bilek', multiplier: 0.9 },
        ],
        specialOffers: [
          { id: 'newclient', name: 'Yeni Müşteri İndirimi', discount: 10, active: true },
          { id: 'returning', name: 'Tekrar Gelen Müşteri', discount: 15, active: true },
          { id: 'seasonal', name: 'Mevsimsel Kampanya', discount: 20, active: false },
        ],
        depositRequired: true,
        depositPercentage: 20,
      };
    } catch (error) {
      console.error('Fiyat kuralları getirme hatası:', error);
      throw error;
    }
  },
  
  // Fiyat hesaplama (client-side hesaplama için yardımcı fonksiyon)
  calculatePrice: (
    size: string,
    style: string,
    placement: string,
    complexity: number,
    pricingRules: PricingRules
  ): number => {
    const sizeObj = pricingRules.sizes.find(s => s.name === size);
    const styleObj = pricingRules.styles.find(s => s.name === style);
    const placementObj = pricingRules.placements.find(p => p.name === placement);
    
    if (!sizeObj || !styleObj || !placementObj) return 0;
    
    // Temel hesaplama
    let price = sizeObj.basePrice;
    price *= styleObj.multiplier;
    price *= placementObj.multiplier;
    
    // Karmaşıklık faktörü
    const complexityFactor = 1 + (complexity - 50) / 100;
    price *= complexityFactor;
    
    // Yuvarlama
    return Math.round(price / 10) * 10;
  },
  
  // Depozito hesaplama
  calculateDeposit: (price: number, pricingRules: PricingRules): number | null => {
    if (!pricingRules.depositRequired) return null;
    return Math.round(price * (pricingRules.depositPercentage / 100));
  },
  
  // İndirim uygulama
  applyDiscount: (price: number, offerId: string, pricingRules: PricingRules): number => {
    const offer = pricingRules.specialOffers.find(o => o.id === offerId);
    
    if (!offer || !offer.active) return price;
    
    const discountAmount = price * (offer.discount / 100);
    return Math.round((price - discountAmount) / 10) * 10;
  },
  
  // Fiyat kurallarını kaydet
  savePricingRules: async (pricingRules: PricingRules): Promise<void> => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId!,
        'settings',
        'pricing_settings',
        {
          value: JSON.stringify(pricingRules)
        }
      ).catch(() => 
        databases.createDocument(
          appwriteConfig.databaseId!,
          'settings',
          'pricing_settings',
          {
            value: JSON.stringify(pricingRules)
          }
        )
      );
    } catch (error) {
      console.error('Fiyat kuralları kaydetme hatası:', error);
      throw error;
    }
  },
};

export default pricingService; 