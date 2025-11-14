/**
 * Authentication Context Provider.
 * Kullanıcı oturum yönetimi ve kimlik doğrulama işlemleri.
 */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getSession, getUser, signOut, setupAuthListener } from '../lib/supabaseClient';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/errorMessages';
import { validateUserData } from '../utils/validators';
import { initializeDatabase } from '../lib/databaseSetup';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@cardvault_auth';
const USER_STORAGE_KEY = '@cardvault_user';

/**
 * Auth Context Provider.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Auth durum değişikliklerini dinle
  useEffect(() => {
    const authListener = setupAuthListener((event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        handleSignIn(session);
      } else if (event === 'SIGNED_OUT') {
        handleSignOut();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
        setAuthError(null);
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
        saveUserData(session.user);
      }
    });

    // Başlangıçta oturum kontrolü
    initializeAuth();

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  /**
   * Başlangıçta auth durumunu yükle
   */
  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Local storage'dan kullanıcı bilgilerini yükle
      const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const savedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (savedUser && savedSession) {
        const parsedUser = JSON.parse(savedUser);
        const parsedSession = JSON.parse(savedSession);
        
        setUser(parsedUser);
        setSession(parsedSession);
        setIsAuthenticated(true);
      }
      
      // Supabase'den güncel oturum bilgilerini al
      const currentSession = await getSession();
      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
        setIsAuthenticated(true);
        await saveAuthData(currentSession);
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
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        await handleSignIn(data.session);
        return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Kayıt işlemi
   */
  const signUp = async (userData) => {
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
        await handleSignIn(data.session);
        return { success: true, message: SUCCESS_MESSAGES.REGISTER_SUCCESS };
      } else {
        // E-posta doğrulama gerekiyor
        return { 
          success: true, 
          message: SUCCESS_MESSAGES.EMAIL_VERIFICATION_SENT,
          requiresVerification: true 
        };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Şifre sıfırlama
   */
  const resetPassword = async (email) => {
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
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Şifre güncelleme
   */
  const updatePassword = async (newPassword) => {
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
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Profil güncelleme
   */
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.updateUser({
        data: profileData,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        await saveUserData(data.user);
        return { success: true, message: SUCCESS_MESSAGES.PROFILE_UPDATED };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Çıkış işlemi
   */
  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      await signOut();
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
  const handleSignIn = async (session) => {
    setSession(session);
    setUser(session.user);
    setIsAuthenticated(true);
    setAuthError(null);

    await saveAuthData(session);

    // Database'i başlat ve test verilerini ekle
    if (session.user) {
      const dbResult = await initializeDatabase(session.user.id);
      if (dbResult.success) {
        console.log('✅ Database hazır:', dbResult.message);
        if (dbResult.stats) {
          console.log('📊 Test verileri:', dbResult.stats);
        }
      } else {
        console.warn('⚠️ Database başlatma uyarısı:', dbResult.error);
      }
    }
  };

  /**
   * Auth verilerini kaydet
   */
  const saveAuthData = async (session) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      if (session.user) {
        await saveUserData(session.user);
      }
    } catch (error) {
      console.error('Save auth data error:', error);
    }
  };

  /**
   * Kullanıcı verilerini kaydet
   */
  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Save user data error:', error);
    }
  };

  /**
   * Auth verilerini temizle
   */
  const clearAuthData = async () => {
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
  const getAuthErrorMessage = (error) => {
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
  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    authError,
    signIn,
    signUp,
    signOut: handleSignOut,
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
 * @returns {object} Auth bilgileri ve fonksiyonları.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;