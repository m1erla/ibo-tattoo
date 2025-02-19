const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
  appointmentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID,
  pushTokensCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PUSH_TOKENS_COLLECTION_ID || "push_tokens",
  portfolioCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID,
  portfolioImagesBucketId: process.env.EXPO_PUBLIC_APPWRITE_PORTFOLIO_IMAGES_BUCKET_ID,
};

export default config; 