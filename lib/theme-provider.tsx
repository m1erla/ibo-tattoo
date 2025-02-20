import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeColorFunction = (isDark: boolean) => string;
type ThemeGradientFunction = (isDark: boolean) => string[];

interface ThemeColors {
  background: {
    primary: ThemeColorFunction;
    secondary: ThemeColorFunction;
    card: ThemeColorFunction;
    gradient: ThemeGradientFunction;
  };
  text: {
    primary: ThemeColorFunction;
    secondary: ThemeColorFunction;
    muted: ThemeColorFunction;
  };
  border: {
    primary: ThemeColorFunction;
  };
  card: {
    background: ThemeColorFunction;
    border: ThemeColorFunction;
    hover: ThemeColorFunction;
  };
  accent: {
    primary: string;
    secondary: string;
  };
  status: {
    pending: {
      background: ThemeColorFunction;
      text: ThemeColorFunction;
    };
    confirmed: {
      background: ThemeColorFunction;
      text: ThemeColorFunction;
    };
    completed: {
      background: ThemeColorFunction;
      text: ThemeColorFunction;
    };
    cancelled: {
      background: ThemeColorFunction;
      text: ThemeColorFunction;
    };
  };
  tabBar: {
    background: ThemeColorFunction;
    active: string;
    inactive: ThemeColorFunction;
  };
}

// ThemeContextType tanımını ekleyelim (en üstte diğer type tanımlarının yanına)
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof themeConfig;
}

// Merkezi tema yapılandırması
export const themeConfig = {
  colors: {
    background: {
      primary: (isDark: boolean) => (isDark ? '#121212' : '#FAFAFA'),
      secondary: (isDark: boolean) => (isDark ? '#1E1E1E' : '#FFFFFF'),
      card: (isDark: boolean) => (isDark ? '#1E1E1E' : '#FFFFFF'),
      gradient: (isDark: boolean) =>
        isDark ? ['#1E1E1E', '#2A2A2A'] : ['#0061FF', '#60EFFF'],
    },
    text: {
      primary: (isDark: boolean) => (isDark ? '#FFFFFF' : '#191D31'),
      secondary: (isDark: boolean) => (isDark ? '#E0E0E0' : '#666876'),
      muted: (isDark: boolean) => (isDark ? '#A0A0A0' : '#999999'),
    },
    border: {
      primary: (isDark: boolean) => (isDark ? '#2A2A2A' : '#E5E5E5'),
    },
    card: {
      background: (isDark: boolean) => (isDark ? '#1E1E1E' : '#FFFFFF'),
      border: (isDark: boolean) => (isDark ? '#2A2A2A' : '#E5E5E5'),
      hover: (isDark: boolean) => (isDark ? '#252525' : '#F5F5F5'),
    },
    accent: {
      primary: '#0061FF',
      secondary: '#60EFFF',
    },
    status: {
      pending: {
        background: (isDark: boolean) => (isDark ? '#2A2005' : '#FFFBEB'),
        text: (isDark: boolean) => (isDark ? '#FACC15' : '#CA8A04'),
      },
      confirmed: {
        background: (isDark: boolean) => (isDark ? '#082F49' : '#F0F9FF'),
        text: (isDark: boolean) => (isDark ? '#38BDF8' : '#0284C7'),
      },
      completed: {
        background: (isDark: boolean) => (isDark ? '#0D2616' : '#F0FDF4'),
        text: (isDark: boolean) => (isDark ? '#4ADE80' : '#16A34A'),
      },
      cancelled: {
        background: (isDark: boolean) => (isDark ? '#2A1215' : '#FEF2F2'),
        text: (isDark: boolean) => (isDark ? '#F87171' : '#DC2626'),
      },
    },
    tabBar: {
      background: (isDark: boolean) => (isDark ? '#1E1E1E' : '#FFFFFF'),
      active: '#0061FF',
      inactive: (isDark: boolean) => (isDark ? '#A0A0A0' : '#666876'),
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    systemColorScheme === 'dark'
  );

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    // Sistem teması değiştiğinde ve kullanıcı özel tema seçmemişse güncelle
    const updateTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (!savedTheme) {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    };
    updateTheme();
  }, [systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Tema tercihi yüklenemedi:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Tema tercihi kaydedilemedi:', error);
    }
  };

  // Dinamik tema değerlerini oluştur
  const theme = {
    ...themeConfig,
    current: {
      isDark: isDarkMode,
      colors: Object.entries(themeConfig.colors).reduce(
        (acc: Record<string, any>, [key, value]: [string, any]) => {
          if (typeof value === 'function') {
            acc[key] = value(isDarkMode);
          } else if (typeof value === 'object') {
            acc[key] = Object.entries(value).reduce(
              (
                subAcc: Record<string, any>,
                [subKey, subValue]: [string, any]
              ) => {
                subAcc[subKey] =
                  typeof subValue === 'function'
                    ? subValue(isDarkMode)
                    : subValue;
                return subAcc;
              },
              {}
            );
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {}
      ),
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
