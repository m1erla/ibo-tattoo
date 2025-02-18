import { Client, Databases, Storage, Account, OAuthProvider, Avatars } from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: "com.m1erla.ibo-tattoo",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    appointmentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID,
    portfolioCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID,
    portfolioImagesBucketId: process.env.EXPO_PUBLIC_APPWRITE_PORTFOLIO_IMAGES_BUCKET_ID,
}

export const appwriteConfig = {
    endpoint: config.endpoint,
    platform: config.platform,
    projectId: config.projectId,
    databaseId: config.databaseId,
    userCollectionId: config.userCollectionId,
}

export const client = new Client()
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const databases = new Databases(client)
export const storage = new Storage(client)
export const account = new Account(client)
export const avatar = new Avatars(client)


export async function login() {
  try {
    // Önce mevcut oturumu temizle
    try {
      await account.deleteSession("current");
    } catch (error) {
      // Mevcut oturum yoksa devam et
    }

    const redirectUri = Linking.createURL("/");
    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    // Yeni kullanıcı bilgilerini al
    const accountDetails = await account.get();
    
    try {
      await databases.createDocument(
        config.databaseId!,
        config.userCollectionId!,
        accountDetails.$id,
        {
          email: accountDetails.email,
          name: accountDetails.name,
          role: "client",
          createdAt: new Date().toISOString(),
        }
      );
    } catch (err: any) {
      if (err.code !== 409) console.error(err);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      // Google avatarını kullan
      const avatarUrl = `https://lh3.googleusercontent.com/a/${result.prefs.avatarId}`;
      
      // Kullanıcı rolünü veritabanından al
      const userData = await databases.getDocument(
        config.databaseId!,
        config.userCollectionId!,
        result.$id
      );

      return {
        ...result,
        avatar: avatarUrl, // Google avatar URL'ini kullan
        role: userData.role || "client"
      };
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}