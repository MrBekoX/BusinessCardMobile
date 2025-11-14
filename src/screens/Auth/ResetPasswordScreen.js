/**
 * Reset Password Screen.
 * Şifre sıfırlama ekranı.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { isValidEmail } from '../../utils/validators';
import { ERROR_MESSAGES } from '../../config/errorMessages';

// Components
import CustomInput from '../../components/common/CustomInput';
import MemoizedButton from '../../components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ResetPasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;
  const { resetPassword, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Email validasyonu
  const validateEmail = () => {
    if (!email.trim()) {
      setError('E-posta adresi zorunludur');
      return false;
    }
    
    if (!isValidEmail(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return false;
    }
    
    setError('');
    return true;
  };

  // Form submit
  const handleSubmit = async () => {
    if (!validateEmail()) return;

    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        setIsSubmitted(true);
        Alert.alert(
          'E-posta Gönderildi',
          'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Hata', result.error || ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Hata', ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  };

  // Input değişiklikleri
  const handleEmailChange = (text) => {
    setEmail(text);
    if (error) {
      setError('');
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIconContainer, { backgroundColor: colors.success + '20' }]}>
            <Icon name="check-circle" size={60} color={colors.success} />
          </View>
          
          <Text style={[styles.successTitle, { color: colors.text }]}>
            E-posta Gönderildi
          </Text>
          
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin ve spam klasörünü kontrol etmeyi unutmayın.
          </Text>
          
          <MemoizedButton
            title="Giriş Ekranına Dön"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="lock-reset" size={60} color={colors.primary} />
            </View>
            
            <Text style={[styles.title, { color: colors.text }]}>
              Şifre Sıfırlama
            </Text>
            
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              E-posta Adresiniz
            </Text>
            
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              Hesabınızla ilişkili e-posta adresini girin
            </Text>

            {/* Email Input */}
            <CustomInput
              label="E-posta Adresi"
              placeholder="ornek@email.com"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error}
              required={true}
              leftIcon={
                <Icon name="email" size={20} color={colors.textSecondary} />
              }
            />

            {/* Bilgi Mesajı */}
            <View style={styles.infoContainer}>
              <Icon name="info" size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Şifre sıfırlama bağlantısı sadece kayıtlı e-posta adreslerine gönderilir. Bağlantı 1 saat geçerlidir.
              </Text>
            </View>

            {/* Submit Button */}
            <MemoizedButton
              title="Şifre Sıfırlama Bağlantısı Gönder"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              fullWidth={true}
              style={styles.submitButton}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                veya
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Back to Login */}
            <MemoizedButton
              title="Giriş Yap"
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth={true}
              style={styles.loginButton}
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
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
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
    fontWeight: TYPOGRAPHY.weights.regular,
    marginHorizontal: SPACING.md,
  },
  loginButton: {
    marginBottom: SPACING.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  backButton: {
    marginTop: SPACING.md,
  },
});

export default ResetPasswordScreen;