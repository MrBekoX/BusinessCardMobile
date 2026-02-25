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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { SPACING, TYPOGRAPHY } from '@constants/theme';
import { validateCardData } from '@utils/validators';
import { ERROR_MESSAGES } from '@config/errorMessages';
import { AppStackParamList } from '@/types/navigation';
import { Logger } from '@lib/logger';

const logger = new Logger('CardCreateScreen');

// Components
import CustomInput from '@components/common/CustomInput';
import MemoizedButton from '@components/common/MemoizedButton';
import Icon from '@expo/vector-icons/MaterialIcons';

// Services
import { createCard } from '@services/cardService';

// ==================== TYPES ====================

type CardCreateScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'CardCreate'>;

interface CardCreateScreenProps {
  navigation: CardCreateScreenNavigationProp;
}

interface CardFormData {
  company_name: string;
  position: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  instagram_url: string;
  linkedin_url: string;
  x_url: string;
  youtube_url: string;
  [key: string]: string;
}

interface FormErrors {
  [key: string]: string;
}

// ==================== COMPONENT ====================

const CardCreateScreen: React.FC<CardCreateScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const colors = theme.colors;

  const [formData, setFormData] = useState<CardFormData>({
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (field: keyof CardFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const validation = validateCardData(formData);

    if (!validation.isValid) {
      setErrors({ general: validation.message || 'Doğrulama hatası' });
      return;
    }

    if (!user?.id) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
      return;
    }

    setLoading(true);
    try {
      const result = await createCard(formData, user.id);

      if (result.success) {
        Alert.alert('Başarılı', result.message || 'Kart oluşturuldu', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Hata', result.error || 'Kart oluşturulamadı');
      }
    } catch (error) {
      logger.error('Card creation error', error);
      Alert.alert('Hata', ERROR_MESSAGES.CARD_CREATION_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Yeni Kartvizit</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Yeni bir kartvizit oluşturun</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput label="Firma Adı" placeholder="Firma adınızı girin" value={formData.company_name} onChangeText={(text) => handleInputChange('company_name', text)} autoCapitalize="words" error={errors.company_name} required={true} leftIcon={<Icon name="business" size={20} color={colors.textSecondary} />} />
            <CustomInput label="Pozisyon / Ünvan" placeholder="Pozisyonunuzu girin" value={formData.position} onChangeText={(text) => handleInputChange('position', text)} autoCapitalize="words" error={errors.position} required={true} leftIcon={<Icon name="work" size={20} color={colors.textSecondary} />} />
            <CustomInput label="Ad Soyad" placeholder="Adınızı ve soyadınızı girin" value={formData.name} onChangeText={(text) => handleInputChange('name', text)} autoCapitalize="words" error={errors.name} leftIcon={<Icon name="person" size={20} color={colors.textSecondary} />} />
            <CustomInput label="E-posta Adresi" placeholder="ornek@email.com" value={formData.email} onChangeText={(text) => handleInputChange('email', text)} keyboardType="email-address" autoCapitalize="none" error={errors.email} leftIcon={<Icon name="email" size={20} color={colors.textSecondary} />} />
            <CustomInput label="Telefon Numarası" placeholder="+90 555 123 4567" value={formData.phone} onChangeText={(text) => handleInputChange('phone', text)} keyboardType="phone-pad" error={errors.phone} leftIcon={<Icon name="phone" size={20} color={colors.textSecondary} />} />
            <CustomInput label="Web Sitesi" placeholder="https://firmaniz.com" value={formData.website} onChangeText={(text) => handleInputChange('website', text)} keyboardType="url" autoCapitalize="none" error={errors.website} leftIcon={<Icon name="language" size={20} color={colors.textSecondary} />} />
            <CustomInput label="Adres" placeholder="Adresinizi girin" value={formData.address} onChangeText={(text) => handleInputChange('address', text)} autoCapitalize="words" multiline={true} numberOfLines={3} error={errors.address} leftIcon={<Icon name="location-on" size={20} color={colors.textSecondary} />} />

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
              <CustomInput label="LinkedIn" placeholder="https://linkedin.com/in/profil" value={formData.linkedin_url} onChangeText={(text) => handleInputChange('linkedin_url', text)} keyboardType="url" autoCapitalize="none" error={errors.linkedin_url} leftIcon={<Icon name="link" size={20} color={colors.textSecondary} />} />
              <CustomInput label="Instagram" placeholder="https://instagram.com/kullaniciadi" value={formData.instagram_url} onChangeText={(text) => handleInputChange('instagram_url', text)} keyboardType="url" autoCapitalize="none" error={errors.instagram_url} leftIcon={<Icon name="link" size={20} color={colors.textSecondary} />} />
              <CustomInput label="X (Twitter)" placeholder="https://x.com/kullaniciadi" value={formData.x_url} onChangeText={(text) => handleInputChange('x_url', text)} keyboardType="url" autoCapitalize="none" error={errors.x_url} leftIcon={<Icon name="link" size={20} color={colors.textSecondary} />} />
              <CustomInput label="YouTube" placeholder="https://youtube.com/kullaniciadi" value={formData.youtube_url} onChangeText={(text) => handleInputChange('youtube_url', text)} keyboardType="url" autoCapitalize="none" error={errors.youtube_url} leftIcon={<Icon name="link" size={20} color={colors.textSecondary} />} />
            </View>

            <MemoizedButton title="Kartvizit Oluştur" onPress={handleSubmit} loading={loading} disabled={loading} fullWidth={true} style={styles.submitButton} />
            <MemoizedButton title="İptal" onPress={() => navigation.goBack()} variant="outline" fullWidth={true} style={styles.cancelButton} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollView: { flexGrow: 1, paddingHorizontal: SPACING.lg },
  header: { marginTop: SPACING.md, marginBottom: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700' as '700', marginBottom: SPACING.xs },
  subtitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '400' as '400' },
  formContainer: { marginBottom: SPACING.xl },
  section: { marginTop: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600' as '600', marginBottom: SPACING.md },
  submitButton: { marginTop: SPACING.xl },
  cancelButton: { marginTop: SPACING.md },
});

export default CardCreateScreen;
