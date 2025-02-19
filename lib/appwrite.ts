import { Client, Databases, Storage, Account, OAuthProvider, Avatars, Functions } from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import config from "@/constants/config";

export const appwriteConfig = {
    endpoint: config.endpoint,
    platform: "com.m1erla.ibo-tattoo",
    projectId: config.projectId,
    databaseId: config.databaseId,
    userCollectionId: config.userCollectionId,
    pushTokensCollectionId: config.pushTokensCollectionId,
    appointmentsCollectionId: config.appointmentsCollectionId,
    portfolioCollectionId: config.portfolioCollectionId,
}

// Appwrite client
const client = new Client()
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!);


export const databases = new Databases(client)
export const storage = new Storage(client)
export const account = new Account(client)
export const avatar = new Avatars(client)
export const functions = new Functions(client)

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
      let avatarUrl = null;
      
      // Google avatarı için prefs kontrolü
      if (result.prefs?.avatarId) {
        avatarUrl = `https://lh3.googleusercontent.com/a/${result.prefs.avatarId}`;
      }
      
      // Kullanıcı rolünü veritabanından al
      const userData = await databases.getDocument(
        config.databaseId!,
        config.userCollectionId!,
        result.$id
      );

      return {
        ...result,
        avatar: avatarUrl, // Eğer avatarUrl null ise, UI tarafında varsayılan avatar kullanılacak
        role: userData.role || "client"
      };
    }
    return null;
  } catch (error) {
    console.log("getCurrentUser error:", error);
    return null;
  }
}

export { client }; // Client'ı da export et