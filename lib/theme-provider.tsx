import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeColorFunction = (isDark: boolean) => string;

interface ThemeColors {
  background: {
    primary: ThemeColorFunction;
    secondary: ThemeColorFunction;
    tertiary: ThemeColorFunction;
  };
  text: {
    primary: ThemeColorFunction;
    secondary: ThemeColorFunction;
    tertiary: ThemeColorFunction;
    inverse: ThemeColorFunction;
  };
  border: {
    primary: ThemeColorFunction;
    secondary: ThemeColorFunction;
  };
  card: {
    background: ThemeColorFunction;
    border: ThemeColorFunction;
    hover: ThemeColorFunction;
  };
  accent: {
    primary: string;
    secondary: string;
    tertiary: string;
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
  gradient: {
    primary: [string, string];
    secondary: [string, string];
    tertiary: [string, string];
    dark: [string, string];
  };
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof themeConfig;
}

export const themeConfig = {
  colors: {
    background: {
      primary: (isDark: boolean) => (isDark ? '#121212' : '#F8F9FA'),
      secondary: (isDark: boolean) => (isDark ? '#1A1A1A' : '#FFFFFF'),
      tertiary: (isDark: boolean) => (isDark ? '#222222' : '#F0F0F0'),
    },
    text: {
      primary: (isDark: boolean) => (isDark ? '#FFFFFF' : '#1A1A1A'),
      secondary: (isDark: boolean) => (isDark ? '#B0B0B0' : '#666666'),
      tertiary: (isDark: boolean) => (isDark ? '#808080' : '#999999'),
      inverse: (isDark: boolean) => (isDark ? '#1A1A1A' : '#FFFFFF'),
    },
    border: {
      primary: (isDark: boolean) => (isDark ? '#2A2A2A' : '#E5E5E5'),
      secondary: (isDark: boolean) => (isDark ? '#333333' : '#EEEEEE'),
    },
    card: {
      background: (isDark: boolean) => (isDark ? '#1E1E1E' : '#FFFFFF'),
      border: (isDark: boolean) => (isDark ? '#2A2A2A' : '#E5E5E5'),
      hover: (isDark: boolean) => (isDark ? '#252525' : '#F5F5F5'),
    },
    accent: {
      primary: '#FF3366', // Modern pembe
      secondary: '#7209B7', // Derin mor
      tertiary: '#4361EE', // Elektrik mavisi
    },
    status: {
      pending: {
        background: (isDark: boolean) => (isDark ? '#3A1D1D' : '#FFF1F1'),
        text: (isDark: boolean) => (isDark ? '#FF9494' : '#DC2626'),
      },
      confirmed: {
        background: (isDark: boolean) => (isDark ? '#1A2F35' : '#F0F9FF'),
        text: (isDark: boolean) => (isDark ? '#7DD3FC' : '#0369A1'),
      },
      completed: {
        background: (isDark: boolean) => (isDark ? '#052E16' : '#F0FDF4'),
        text: (isDark: boolean) => (isDark ? '#4ADE80' : '#16A34A'),
      },
      cancelled: {
        background: (isDark: boolean) => (isDark ? '#2A1215' : '#FEF2F2'),
        text: (isDark: boolean) => (isDark ? '#F87171' : '#DC2626'),
      },
    },
    gradient: {
      primary: ['#FF3366', '#7209B7'] as [string, string], // Pembe -> Mor
      secondary: ['#4361EE', '#3A0CA3'] as [string, string], // Mavi -> Lacivert
      tertiary: ['#7209B7', '#3A0CA3'] as [string, string], // Mor -> Lacivert
      dark: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as [string, string], // Şeffaf -> Siyah
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  typography: {
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      display: 32,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
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

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, theme: themeConfig }}
    >
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
