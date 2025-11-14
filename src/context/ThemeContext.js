/**
 * Tema Context Provider.
 * Light, Dark ve System tema modu desteği.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const ThemeContext = createContext();

const THEME_KEY = '@cardvault_theme';

/**
 * Tema Context Provider.
 * Light, Dark ve System tema modu desteği.
 */
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'
  const [isDark, setIsDark] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

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

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved) {
        setThemeMode(saved);
        updateTheme(saved);
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

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Tema kaydedilemedi:', error);
    }
  };

  const updateTheme = (mode) => {
    if (mode === 'system') {
      const systemTheme = Appearance.getColorScheme();
      setIsDark(systemTheme === 'dark');
      setIsSystemTheme(true);
    } else {
      setIsDark(mode === 'dark');
      setIsSystemTheme(false);
    }
  };

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const setTheme = (mode) => {
    if (['light', 'dark', 'system'].includes(mode)) {
      setThemeMode(mode);
    }
  };

  const getThemeColors = () => {
    return isDark ? COLORS.dark : COLORS.light;
  };

  const getSystemColors = () => {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? COLORS.dark : COLORS.light;
  };

  const theme = {
    colors: getThemeColors(),
    systemColors: getSystemColors(),
    isDark,
    isSystemTheme,
    themeMode,
    toggleTheme,
    setTheme,
    updateTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Tema context'ine erişmek için custom hook.
 * @returns {object} Tema bilgileri ve fonksiyonları.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Tema tabanlı stiller oluşturmak için yardımcı hook
 * @param {function} styleFunction - Temaya göre stiller döndüren fonksiyon
 * @returns {object} Hesaplanmış stiller
 */
export const useThemedStyles = (styleFunction) => {
  const theme = useTheme();
  return styleFunction(theme);
};

/**
 * Dinamik tema renkleri için yardımcı fonksiyonlar
 */
export const themeUtils = {
  /**
   * Tema bazlı renk seçimi
   * @param {boolean} isDark - Koyu tema mı
   * @param {string} lightColor - Açık tema rengi
   * @param {string} darkColor - Koyu tema rengi
   * @returns {string} Seçilen renk
   */
  getThemeColor: (isDark, lightColor, darkColor) => {
    return isDark ? darkColor : lightColor;
  },

  /**
   * Tema bazlı stil oluşturma
   * @param {boolean} isDark - Koyu tema mı
   * @param {object} lightStyles - Açık tema stilleri
   * @param {object} darkStyles - Koyu tema stilleri
   * @returns {object} Birleştirilmiş stiller
   */
  getThemeStyles: (isDark, lightStyles, darkStyles) => {
    return {
      ...lightStyles,
      ...(isDark ? darkStyles : {}),
    };
  },

  /**
   * Sistem temasını kullanarak stil oluşturma
   * @param {object} lightStyles - Açık tema stilleri
   * @param {object} darkStyles - Koyu tema stilleri
   * @returns {object} Birleştirilmiş stiller
   */
  getSystemThemeStyles: (lightStyles, darkStyles) => {
    const systemTheme = Appearance.getColorScheme();
    const isDark = systemTheme === 'dark';
    return themeUtils.getThemeStyles(isDark, lightStyles, darkStyles);
  },
};