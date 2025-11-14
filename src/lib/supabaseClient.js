/**
 * Supabase client initialization and configuration
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import Settings from '../config/settings';

// AsyncStorage adapter for Supabase
const AsyncStorageAdapter = {
  getItem: async (key) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    await AsyncStorage.removeItem(key);
  },
};

// Supabase client'ı oluştur
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorageAdapter,
  },
  global: {
    headers: {
      'X-Client-Info': `cardvault-react-native/${Settings.app.version}`,
    },
  },
});

// Auth durumu değişikliklerini dinle
export const setupAuthListener = (callback) => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth state changed:', event);
      callback(event, session);
    }
  );

  return authListener;
};

// Session bilgilerini al
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Session get error:', error);
    return null;
  }
};

// Kullanıcı bilgilerini al
export const getUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('User get error:', error);
    return null;
  }
};

// Oturum kapat
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error };
  }
};

export default supabase;