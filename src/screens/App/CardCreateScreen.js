/**
 * Card Create Screen.
 * Yeni kartvizit oluşturma ekranı.
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
import { validateCardData } from '../../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../config/errorMessages';

// Components
import CustomInput from '../../components/common/CustomInput';
import MemoizedButton from '../../components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Services
import { createCard } from '../../services/cardService';

const CardCreateScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const colors = theme.colors;

  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    instagram_url: '',
    linkedin_url: '',
    x_url: '',
    youtube_url: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    const validation = validateCardData(formData);

    if (!validation.isValid) {
      setErrors({ general: validation.message });
      return;
    }

    setLoading(true);
    try {
      const result = await createCard(formData, user.id);

      if (result.success) {
        Alert.alert(
          'Başarılı',
          result.message,
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Hata', result.error);
      }
    } catch (error) {
      console.error('Card creation error:', error);
      Alert.alert('Hata', ERROR_MESSAGES.CARD_CREATION_FAILED);
    } finally {
      setLoading(false);
    }
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
            <Text style={[styles.title, { color: colors.text }]}>
              Yeni Kartvizit
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Yeni bir kartvizit oluşturun
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Company Name */}
            <CustomInput
              label="Firma Adı"
              placeholder="Firma adınızı girin"
              value={formData.company_name}
              onChangeText={(text) => handleInputChange('company_name', text)}
              autoCapitalize="words"
              error={errors.company_name}
              required={true}
              leftIcon={
                <Icon name="business" size={20} color={colors.textSecondary} />
              }
            />

            {/* Position */}
            <CustomInput
              label="Pozisyon / Ünvan"
              placeholder="Pozisyonunuzu girin"
              value={formData.position}
              onChangeText={(text) => handleInputChange('position', text)}
              autoCapitalize="words"
              error={errors.position}
              required={true}
              leftIcon={
                <Icon name="work" size={20} color={colors.textSecondary} />
              }
            />

            {/* Name */}
            <CustomInput
              label="Ad Soyad"
              placeholder="Adınızı ve soyadınızı girin"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              autoCapitalize="words"
              error={errors.name}
              leftIcon={
                <Icon name="person" size={20} color={colors.textSecondary} />
              }
            />

            {/* Email */}
            <CustomInput
              label="E-posta Adresi"
              placeholder="ornek@email.com"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              leftIcon={
                <Icon name="email" size={20} color={colors.textSecondary} />
              }
            />

            {/* Phone */}
            <CustomInput
              label="Telefon Numarası"
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

            {/* Website */}
            <CustomInput
              label="Web Sitesi"
              placeholder="https://firmaniz.com"
              value={formData.website}
              onChangeText={(text) => handleInputChange('website', text)}
              keyboardType="url"
              autoCapitalize="none"
              autoComplete="url"
              error={errors.website}
              leftIcon={
                <Icon name="language" size={20} color={colors.textSecondary} />
              }
            />

            {/* Address */}
            <CustomInput
              label="Adres"
              placeholder="Adresinizi girin"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              autoCapitalize="words"
              multiline={true}
              numberOfLines={3}
              error={errors.address}
              leftIcon={
                <Icon name="location-on" size={20} color={colors.textSecondary} />
              }
            />

            {/* Social Media Links */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sosyal Medya
              </Text>
              
              <CustomInput
                label="LinkedIn"
                placeholder="https://linkedin.com/in/profil"
                value={formData.linkedin_url}
                onChangeText={(text) => handleInputChange('linkedin_url', text)}
                keyboardType="url"
                autoCapitalize="none"
                error={errors.linkedin_url}
                leftIcon={
                  <Icon name="link" size={20} color={colors.textSecondary} />
                }
              />
              
              <CustomInput
                label="Instagram"
                placeholder="https://instagram.com/kullaniciadi"
                value={formData.instagram_url}
                onChangeText={(text) => handleInputChange('instagram_url', text)}
                keyboardType="url"
                autoCapitalize="none"
                error={errors.instagram_url}
                leftIcon={
                  <Icon name="link" size={20} color={colors.textSecondary} />
                }
              />
              
              <CustomInput
                label="X (Twitter)"
                placeholder="https://x.com/kullaniciadi"
                value={formData.x_url}
                onChangeText={(text) => handleInputChange('x_url', text)}
                keyboardType="url"
                autoCapitalize="none"
                error={errors.x_url}
                leftIcon={
                  <Icon name="link" size={20} color={colors.textSecondary} />
                }
              />
              
              <CustomInput
                label="YouTube"
                placeholder="https://youtube.com/kullaniciadi"
                value={formData.youtube_url}
                onChangeText={(text) => handleInputChange('youtube_url', text)}
                keyboardType="url"
                autoCapitalize="none"
                error={errors.youtube_url}
                leftIcon={
                  <Icon name="link" size={20} color={colors.textSecondary} />
                }
              />
            </View>

            {/* Submit Button */}
            <MemoizedButton
              title="Kartvizit Oluştur"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              fullWidth={true}
              style={styles.submitButton}
            />

            {/* Cancel Button */}
            <MemoizedButton
              title="İptal"
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth={true}
              style={styles.cancelButton}
            />
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
    marginBottom: SPACING.lg,
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
  section: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  submitButton: {
    marginTop: SPACING.xl,
  },
  cancelButton: {
    marginTop: SPACING.md,
  },
});

export default CardCreateScreen;