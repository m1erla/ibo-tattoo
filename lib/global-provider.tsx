import { createContext, useContext, useEffect, useState } from "react";
import { account, getCurrentUser } from "./appwrite";
import { Models } from "react-native-appwrite";
import { client } from "./appwrite";

interface User extends Models.User<Models.Preferences> {
  role: "admin" | "client";
  avatar?: string;
}

interface GlobalContextType {
  user: User | null;
  loading: boolean;
  isLogged: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType>({
  user: null,
  loading: true,
  isLogged: false,
  refetch: async () => {},
  logout: async () => {},
  setLoading: () => {},
});

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Session değişikliklerini dinle
  useEffect(() => {
    const unsubscribe = client.subscribe(`account`, (response) => {
      if (response.events.includes("account.sessions.delete")) {
        setUser(null);
      } else if (response.events.includes("account.sessions.create")) {
        fetchUser();
      }
    });

    fetchUser();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        user,
        loading,
        isLogged: !!user,
        refetch: fetchUser,
        logout,
        setLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => useContext(GlobalContext);
