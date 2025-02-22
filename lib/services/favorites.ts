// Mock favoriler için basit bir in-memory storage
let mockFavorites: { userId: string; portfolioItemId: string }[] = [];

export const favoritesService = {
  getUserFavorites: async (userId: string) => {
    // Mock veri dön
    return mockFavorites.filter(fav => fav.userId === userId);
  },

  addToFavorites: async (userId: string, portfolioItemId: string) => {
    mockFavorites.push({ userId, portfolioItemId });
    return true;
  },

  removeFromFavorites: async (portfolioItemId: string) => {
    mockFavorites = mockFavorites.filter(fav => fav.portfolioItemId !== portfolioItemId);
    return true;
  }
}; 