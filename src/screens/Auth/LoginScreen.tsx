/**
 * Login Screen.
 * Kullanıcı girişi ekranı.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { SPACING, TYPOGRAPHY } from '@constants/theme';
import { isValidEmail } from '@utils/validators';
import { ERROR_MESSAGES } from '@config/errorMessages';
import { AuthStackParamList } from '@/types/navigation';
import { Logger } from '@lib/logger';

const logger = new Logger('LoginScreen');

// Components
import CustomInput from '@components/common/CustomInput';
import MemoizedButton from '@components/common/MemoizedButton';
import Icon from '@expo/vector-icons/MaterialIcons';

// ==================== TYPES ====================

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

// ==================== COMPONENT ====================

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;
  const { signIn, loading, clearError } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Hataları temizle
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: FormErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi zorunludur';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Form submit
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      const result = await signIn(formData.email.trim(), formData.password);
      
      if (result.success) {
        logger.info('Login successful');
      } else {
        Alert.alert('Giriş Başarısız', result.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error) {
      logger.error('Login error', error);
      Alert.alert('Hata', ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  };

  // Input değişiklikleri
  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Hata temizleme
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Şifre görünürlüğünü değiştir
  const toggleShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="business-center" size={60} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              CardVault
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Dijital kartvizit yönetim uygulaması
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Hoş Geldiniz
            </Text>
            
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              Hesabınıza giriş yapın
            </Text>

            {/* Email Input */}
            <CustomInput
              label="E-posta Adresi"
              placeholder="ornek@email.com"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              required={true}
              leftIcon={
                <Icon name="email" size={20} color={colors.textSecondary} />
              }
            />

            {/* Password Input */}
            <CustomInput
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry={!showPassword}
              error={errors.password}
              required={true}
              leftIcon={
                <Icon name="lock" size={20} color={colors.textSecondary} />
              }
              rightIcon={
                <TouchableOpacity onPress={toggleShowPassword}>
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Şifremi Unuttum
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <MemoizedButton
              title="Giriş Yap"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              fullWidth={true}
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                veya
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Register Button */}
            <MemoizedButton
              title="Hesap Oluştur"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              fullWidth={true}
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              CardVault © 2024
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold as '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular as '400',
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular as '400',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: SPACING.sm,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular as '400',
    marginHorizontal: SPACING.md,
  },
  registerButton: {
    marginBottom: SPACING.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular as '400',
  },
});

export default LoginScreen;
