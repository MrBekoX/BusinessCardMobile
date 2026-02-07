/**
 * Authentication Context Provider.
 * Kullanıcı oturum yönetimi ve kimlik doğrulama işlemleri.
 */
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getSession, signOut as supabaseSignOut, setupAuthListener } from '@lib/supabaseClient';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@config/errorMessages';
import { validateUserData } from '@utils/validators';
import { initializeDatabase } from '@lib/databaseSetup';
import { User, Session, ServiceResponse, AuthResponse } from '@/types';

// ==================== TYPES ====================

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (userData: SignUpData) => Promise<AuthResponse>;
  signOut: () => Promise<ServiceResponse<void>>;
  resetPassword: (email: string) => Promise<ServiceResponse<void>>;
  updatePassword: (newPassword: string) => Promise<ServiceResponse<void>>;
  updateProfile: (profileData: Record<string, unknown>) => Promise<ServiceResponse<void>>;
  clearError: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthError {
  code?: string;
  message: string;
}

// ==================== CONTEXT ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = '@cardvault_auth';
const USER_STORAGE_KEY = '@cardvault_user';

/**
 * Auth Context Provider.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Auth durum değişikliklerini dinle
  useEffect(() => {
    const authListener = setupAuthListener((event, sessionData) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && sessionData) {
        handleSignIn(sessionData as Session);
      } else if (event === 'SIGNED_OUT') {
        handleSignOutInternal();
      } else if (event === 'TOKEN_REFRESHED' && sessionData) {
        setSession(sessionData as Session);
        setAuthError(null);
      } else if (event === 'USER_UPDATED' && sessionData) {
        setUser((sessionData as Session).user as User);
        saveUserData((sessionData as Session).user as User);
      }
    });

    // Başlangıçta oturum kontrolü
    initializeAuth();

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Başlangıçta auth durumunu yükle
   */
  const initializeAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Local storage'dan kullanıcı bilgilerini yükle
      const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const savedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (savedUser && savedSession) {
        const parsedUser = JSON.parse(savedUser) as User;
        const parsedSession = JSON.parse(savedSession) as Session;
        
        setUser(parsedUser);
        setSession(parsedSession);
        setIsAuthenticated(true);
      }
      
      // Supabase'den güncel oturum bilgilerini al
      const currentSession = await getSession();
      if (currentSession) {
        setUser(currentSession.user as User);
        setSession(currentSession as Session);
        setIsAuthenticated(true);
        await saveAuthData(currentSession as Session);
      } else {
        // Oturum süresi dolmuşsa temizle
        await clearAuthData();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthError(ERROR_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Giriş işlemi
   */
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        await handleSignIn(data.session as Session);
        return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
      }

      return { success: false, error: ERROR_MESSAGES.UNEXPECTED_ERROR };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Kayıt işlemi
   */
  const signUp = async (userData: SignUpData): Promise<AuthResponse> => {
    try {
      // Validasyon
      const validation = validateUserData(userData);
      if (!validation.isValid) {
        return { success: false, error: validation.message };
      }

      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone || null,
            display_name: `${userData.first_name} ${userData.last_name}`,
          },
        },
      });

      if (error) throw error;

      if (data.session && data.user) {
        await handleSignIn(data.session as Session);
        return { success: true, message: SUCCESS_MESSAGES.REGISTER_SUCCESS };
      } else {
        // E-posta doğrulama gerekiyor
        return { 
          success: true, 
          message: SUCCESS_MESSAGES.EMAIL_VERIFICATION_SENT,
          requiresVerification: true,
        };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Şifre sıfırlama
   */
  const resetPassword = async (email: string): Promise<ServiceResponse<void>> => {
    try {
      setLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'cardvault://auth/reset-password',
      });

      if (error) throw error;

      return { success: true, message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS };
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Şifre güncelleme
   */
  const updatePassword = async (newPassword: string): Promise<ServiceResponse<void>> => {
    try {
      setLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { success: true, message: SUCCESS_MESSAGES.PASSWORD_CHANGED };
    } catch (error) {
      console.error('Password update error:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Profil güncelleme
   */
  const updateProfile = async (profileData: Record<string, unknown>): Promise<ServiceResponse<void>> => {
    try {
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.updateUser({
        data: profileData,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user as User);
        await saveUserData(data.user as User);
        return { success: true, message: SUCCESS_MESSAGES.PROFILE_UPDATED };
      }

      return { success: false, error: ERROR_MESSAGES.UNEXPECTED_ERROR };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Çıkış işlemi (public)
   */
  const handleSignOutInternal = async (): Promise<ServiceResponse<void>> => {
    try {
      setLoading(true);
      
      await supabaseSignOut();
      await clearAuthData();
      
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setAuthError(null);
      
      return { success: true, message: SUCCESS_MESSAGES.LOGOUT_SUCCESS };
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthError(ERROR_MESSAGES.UNEXPECTED_ERROR);
      return { success: false, error: ERROR_MESSAGES.UNEXPECTED_ERROR };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Giriş başarılı
   */
  const handleSignIn = async (sessionData: Session): Promise<void> => {
    setSession(sessionData);
    setUser(sessionData.user as User);
    setIsAuthenticated(true);
    setAuthError(null);

    await saveAuthData(sessionData);

    // Database'i başlat ve test verilerini ekle
    if (sessionData.user) {
      const dbResult = await initializeDatabase(sessionData.user.id);
      if (dbResult.success) {
        console.log('✅ Database hazır:', dbResult.message);
      } else {
        console.warn('⚠️ Database başlatma uyarısı:', dbResult.error);
      }
    }
  };

  /**
   * Auth verilerini kaydet
   */
  const saveAuthData = async (sessionData: Session): Promise<void> => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      if (sessionData.user) {
        await saveUserData(sessionData.user as User);
      }
    } catch (error) {
      console.error('Save auth data error:', error);
    }
  };

  /**
   * Kullanıcı verilerini kaydet
   */
  const saveUserData = async (userData: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Save user data error:', error);
    }
  };

  /**
   * Auth verilerini temizle
   */
  const clearAuthData = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Clear auth data error:', error);
    }
  };

  /**
   * Hata mesajını dönüştür
   */
  const getAuthErrorMessage = (error: AuthError): string => {
    if (!error) return ERROR_MESSAGES.UNEXPECTED_ERROR;
    
    const errorCode = error.code || error.message;
    
    switch (errorCode) {
      case 'invalid_credentials':
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      case 'user_not_found':
        return ERROR_MESSAGES.USER_NOT_FOUND;
      case 'email_already_exists':
      case 'user_already_exists':
        return ERROR_MESSAGES.EMAIL_ALREADY_IN_USE;
      case 'weak_password':
        return ERROR_MESSAGES.WEAK_PASSWORD;
      case 'session_expired':
        return ERROR_MESSAGES.SESSION_EXPIRED;
      case 'network_request_failed':
        return ERROR_MESSAGES.NETWORK_REQUEST_FAILED;
      default:
        return ERROR_MESSAGES.UNEXPECTED_ERROR;
    }
  };

  /**
   * Hata temizleme
   */
  const clearError = (): void => {
    setAuthError(null);
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isAuthenticated,
    authError,
    signIn,
    signUp,
    signOut: handleSignOutInternal,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Auth context'ine erişmek için custom hook.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
