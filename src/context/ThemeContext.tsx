/**
 * Tema Context Provider.
 * Light, Dark ve System tema modu desteği.
 */
import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@constants/theme';

// ==================== TYPES ====================

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  [key: string]: string;
}

interface ThemeContextValue {
  colors: ThemeColors;
  systemColors: ThemeColors;
  isDark: boolean;
  isSystemTheme: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  updateTheme: (mode: ThemeMode) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// ==================== CONTEXT ====================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = '@cardvault_theme';

/**
 * Tema Context Provider.
 * Light, Dark ve System tema modu desteği.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(true);

  // Sistem temasını dinle
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        setIsDark(colorScheme === 'dark');
        setIsSystemTheme(true);
      }
    });

    return () => subscription.remove();
  }, [themeMode]);

  // Kaydedilmiş tema tercihini yükle
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Tema değiştiğinde kaydet ve uygula
  useEffect(() => {
    saveThemePreference(themeMode);
    updateTheme(themeMode);
  }, [themeMode]);

  const loadThemePreference = async (): Promise<void> => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemeMode(saved as ThemeMode);
        updateTheme(saved as ThemeMode);
      } else {
        // İlk kez açılıyorsa sistem temasını kullan
        const systemTheme = Appearance.getColorScheme();
        setIsDark(systemTheme === 'dark');
        setIsSystemTheme(true);
      }
    } catch (error) {
      console.error('Tema yüklenemedi:', error);
      // Hata durumunda sistem temasını kullan
      const systemTheme = Appearance.getColorScheme();
      setIsDark(systemTheme === 'dark');
      setIsSystemTheme(true);
    }
  };

  const saveThemePreference = async (mode: ThemeMode): Promise<void> => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Tema kaydedilemedi:', error);
    }
  };

  const updateTheme = (mode: ThemeMode): void => {
    if (mode === 'system') {
      const systemTheme = Appearance.getColorScheme();
      setIsDark(systemTheme === 'dark');
      setIsSystemTheme(true);
    } else {
      setIsDark(mode === 'dark');
      setIsSystemTheme(false);
    }
  };

  const toggleTheme = (): void => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const setTheme = (mode: ThemeMode): void => {
    if (['light', 'dark', 'system'].includes(mode)) {
      setThemeMode(mode);
    }
  };

  const getThemeColors = (): ThemeColors => {
    const baseColors = isDark ? COLORS.dark : COLORS.light;
    return {
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      ...baseColors,
    } as ThemeColors;
  };

  const getSystemColors = (): ThemeColors => {
    const systemTheme: ColorSchemeName = Appearance.getColorScheme();
    const baseColors = systemTheme === 'dark' ? COLORS.dark : COLORS.light;
    return {
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      ...baseColors,
    } as ThemeColors;
  };

  const theme = useMemo<ThemeContextValue>(() => ({
    colors: getThemeColors(),
    systemColors: getSystemColors(),
    isDark,
    isSystemTheme,
    themeMode,
    toggleTheme,
    setTheme,
    updateTheme,
  }), [isDark, isSystemTheme, themeMode]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Tema context'ine erişmek için custom hook.
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Tema tabanlı stiller oluşturmak için yardımcı hook
 */
export const useThemedStyles = <T,>(styleFunction: (theme: ThemeContextValue) => T): T => {
  const theme = useTheme();
  return styleFunction(theme);
};

/**
 * Dinamik tema renkleri için yardımcı fonksiyonlar
 */
export const themeUtils = {
  /**
   * Tema bazlı renk seçimi
   */
  getThemeColor: (isDark: boolean, lightColor: string, darkColor: string): string => {
    return isDark ? darkColor : lightColor;
  },

  /**
   * Tema bazlı stil oluşturma
   */
  getThemeStyles: <T extends Record<string, unknown>>(
    isDark: boolean,
    lightStyles: T,
    darkStyles: Partial<T>
  ): T => {
    return {
      ...lightStyles,
      ...(isDark ? darkStyles : {}),
    };
  },

  /**
   * Sistem temasını kullanarak stil oluşturma
   */
  getSystemThemeStyles: <T extends Record<string, unknown>>(
    lightStyles: T,
    darkStyles: Partial<T>
  ): T => {
    const systemTheme = Appearance.getColorScheme();
    const isDark = systemTheme === 'dark';
    return themeUtils.getThemeStyles(isDark, lightStyles, darkStyles);
  },
};

export default ThemeContext;
