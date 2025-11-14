/**
 * Register Screen.
 * Yeni kullanıcı kaydı ekranı.
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
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { isValidEmail, isValidPassword, isValidPhone } from '../../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../config/errorMessages';

// Components
import CustomInput from '../../components/common/CustomInput';
import MemoizedButton from '../../components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;
  const { signUp, loading, authError, clearError } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hataları temizle
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // Form validasyonu
  const validateForm = () => {
    const newErrors = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ad zorunludur';
      isValid = false;
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Ad en az 2 karakter olmalıdır';
      isValid = false;
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Soyad zorunludur';
      isValid = false;
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Soyad en az 2 karakter olmalıdır';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi zorunludur';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
      isValid = false;
    }

    // Phone validation (optional)
    if (formData.phone.trim() && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
      isValid = false;
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Şifre en az 8 karakter, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı zorunludur';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Form submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        password: formData.password,
      };

      const result = await signUp(userData);
      
      if (result.success) {
        Alert.alert(
          'Kayıt Başarılı',
          result.requiresVerification 
            ? 'E-posta adresinize doğrulama bağlantısı gönderildi. Lütfen e-postanızı kontrol edin.'
            : 'Hesabınız başarıyla oluşturuldu.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                if (!result.requiresVerification) {
                  // Ana ekrana yönlendirme App.js'de yapılır
                  console.log('Registration successful');
                } else {
                  navigation.navigate('Login');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Kayıt Başarısız', result.error || ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Hata', ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  };

  // Input değişiklikleri
  const handleInputChange = (field, value) => {
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
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: colors.text }]}>
              Hesap Oluştur
            </Text>
            
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Yeni bir hesap oluşturun
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            {/* First Name Input */}
            <CustomInput
              label="Ad"
              placeholder="Adınızı girin"
              value={formData.first_name}
              onChangeText={(text) => handleInputChange('first_name', text)}
              autoCapitalize="words"
              autoComplete="given-name"
              error={errors.first_name}
              required={true}
              leftIcon={
                <Icon name="person" size={20} color={colors.textSecondary} />
              }
            />

            {/* Last Name Input */}
            <CustomInput
              label="Soyad"
              placeholder="Soyadınızı girin"
              value={formData.last_name}
              onChangeText={(text) => handleInputChange('last_name', text)}
              autoCapitalize="words"
              autoComplete="family-name"
              error={errors.last_name}
              required={true}
              leftIcon={
                <Icon name="person" size={20} color={colors.textSecondary} />
              }
            />

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

            {/* Phone Input (Optional) */}
            <CustomInput
              label="Telefon Numarası (İsteğe Bağlı)"
              placeholder="+90 555 123 4567"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
              autoComplete="tel"
              error={errors.phone}
              leftIcon={
                <Icon name="phone" size={20} color={colors.textSecondary} />
              }
            />

            {/* Password Input */}
            <CustomInput
              label="Şifre"
              placeholder="Şifrenizi oluşturun"
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

            {/* Confirm Password Input */}
            <CustomInput
              label="Şifre Tekrarı"
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              required={true}
              leftIcon={
                <Icon name="lock" size={20} color={colors.textSecondary} />
              }
              rightIcon={
                <TouchableOpacity onPress={toggleShowConfirmPassword}>
                  <Icon
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                Kayıt olarak{' '}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.termsLink, { color: colors.primary }]}>
                  Kullanım Koşulları
                </Text>
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                {' '}ve{' '}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.termsLink, { color: colors.primary }]}>
                  Gizlilik Politikasını
                </Text>
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                {' '}kabul etmiş olursunuz.
              </Text>
            </View>

            {/* Register Button */}
            <MemoizedButton
              title="Hesap Oluştur"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              fullWidth={true}
              style={styles.registerButton}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Zaten bir hesabınız var mı?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  termsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  termsLink: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: SPACING.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  loginText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default RegisterScreen;