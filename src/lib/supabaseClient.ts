/**
 * Supabase client initialization and configuration
 */
import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import Settings from '@config/settings';
import { Logger } from './logger';

const logger = new Logger('SupabaseClient');

// SecureStore adapter type for Supabase
interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// SecureStore adapter for Supabase - provides encrypted storage for auth tokens
// This replaces AsyncStorage to prevent token leakage on rooted/jailbroken devices
const SecureStorageAdapter: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      logger.error('SecureStore getItem error', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      logger.error('SecureStore setItem error', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      logger.error('SecureStore removeItem error', error);
    }
  },
};

// Supabase client'ı oluştur
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: SecureStorageAdapter,
  },
  global: {
    headers: {
      'X-Client-Info': `cardvault-react-native/${Settings.app.version}`,
    },
  },
});

// Auth listener callback type
type AuthListenerCallback = (event: AuthChangeEvent, session: Session | null) => void;

// Auth durumu değişikliklerini dinle
export const setupAuthListener = (callback: AuthListenerCallback) => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      logger.debug(`Auth state changed: ${event}`);
      callback(event, session);
    }
  );

  return authListener;
};

// Session bilgilerini al
export const getSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    logger.error('Session get error', error);
    return null;
  }
};

// Kullanıcı bilgilerini al
export const getUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    logger.error('User get error', error);
    return null;
  }
};

// Sign out response type
interface SignOutResponse {
  success: boolean;
  error?: Error;
}

// Oturum kapat
export const signOut = async (): Promise<SignOutResponse> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Sign out error', error);
    return { success: false, error: error as Error };
  }
};

export default supabase;
