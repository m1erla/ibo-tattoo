import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/appwrite';

interface GlobalContextType {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('User refresh error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <GlobalContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => useContext(GlobalContext);
