/**
 * Card Detail Screen.
 * Kartvizit detay görüntüleme ekranı.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '@context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '@constants/theme';
import { formatPhone, getInitials, generateRandomColor } from '@utils/formatters';
import { AppStackParamList } from '@/types/navigation';

// Components
import MemoizedButton from '@components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Card as CardType } from '@/types';

// ==================== TYPES ====================

type CardDetailScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'CardDetail'>;
type CardDetailScreenRouteProp = RouteProp<AppStackParamList, 'CardDetail'>;

interface CardDetailScreenProps {
  navigation: CardDetailScreenNavigationProp;
  route: CardDetailScreenRouteProp;
}

// ==================== COMPONENT ====================

const CardDetailScreen: React.FC<CardDetailScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;
  
  const { cardId } = route.params;
  const [loading, setLoading] = useState<boolean>(false);
  const [card, setCard] = useState<CardType | null>(null);

  // Load card on mount - for now using mock data
  React.useEffect(() => {
    // Mock card for demonstration
    setCard({
      id: cardId,
      user_id: 'user1',
      company_name: 'Örnek Firma',
      position: 'Yazılım Geliştirici',
      name: 'Örnek Kullanıcı',
      email: 'ornek@firma.com',
      phone: '+90 555 123 4567',
      website: 'https://firma.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }, [cardId]);

  if (!card) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Kartvizit bulunamadı
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getInitialsColor = (name: string): string => generateRandomColor(name);

  const renderAvatar = (): React.ReactNode => {
    if (card.profile_image) {
      return <Image source={{ uri: card.profile_image }} style={styles.avatarImage} resizeMode="cover" />;
    }

    const initials = getInitials(card.company_name || card.name || '');
    const backgroundColor = getInitialsColor(card.company_name || card.name || '');

    return (
      <View style={[styles.avatarFallback, { backgroundColor }]}>
        <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>{initials}</Text>
      </View>
    );
  };

  const handleCall = (phone: string): void => {
    Alert.alert('Arama', `Şu numarayı arayın: ${phone}`);
  };

  const handleEmail = (email: string): void => {
    Alert.alert('E-posta', `Şu adrese e-posta gönderin: ${email}`);
  };

  const handleShare = (): void => {
    Alert.alert('Paylaş', `${card.company_name} kartvizitini paylaş`);
  };

  const handleDelete = (): void => {
    Alert.alert('Kartviziti Sil', 'Bu kartviziti silmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigation.goBack();
          } catch (error) {
            Alert.alert('Hata', 'Kartvizit silinemedi');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderContactButton = (icon: string, title: string, onPress: () => void, color: string): React.ReactNode => (
    <TouchableOpacity style={[styles.contactButton, { backgroundColor: color + '20' }]} onPress={onPress}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.contactButtonText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction} onPress={handleDelete} disabled={loading}>
              <Icon name="delete" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.cardPreview, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            {renderAvatar()}
            <View style={styles.cardInfo}>
              <Text style={[styles.companyName, { color: colors.text }]}>{card.company_name}</Text>
              <Text style={[styles.position, { color: colors.textSecondary }]}>{card.position}</Text>
              {card.name && <Text style={[styles.name, { color: colors.textSecondary }]}>{card.name}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İletişim Bilgileri</Text>
          {card.email && (
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{card.email}</Text>
            </View>
          )}
          {card.phone && (
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{formatPhone(card.phone)}</Text>
            </View>
          )}
          {card.website && (
            <View style={styles.infoRow}>
              <Icon name="language" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{card.website}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Eylemler</Text>
          <View style={styles.contactButtons}>
            {card.phone && renderContactButton('phone', 'Ara', () => handleCall(card.phone || ''), colors.success)}
            {card.email && renderContactButton('email', 'E-posta', () => handleEmail(card.email || ''), colors.primary)}
            {renderContactButton('share', 'Paylaş', handleShare, colors.warning)}
          </View>
        </View>

        <View style={styles.section}>
          <MemoizedButton title="QR Kod Oluştur" onPress={() => Alert.alert('QR Kod', 'QR kod oluşturma özelliği yakında eklenecek')} variant="outline" fullWidth={true} />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { paddingHorizontal: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.lg },
  backButton: { padding: SPACING.xs },
  headerActions: { flexDirection: 'row' },
  headerAction: { padding: SPACING.xs, marginLeft: SPACING.sm },
  cardPreview: { marginHorizontal: -SPACING.md, marginBottom: SPACING.lg, padding: SPACING.lg, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700' as '700' },
  cardInfo: { marginLeft: SPACING.md, flex: 1 },
  companyName: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700' as '700', marginBottom: 2 },
  position: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500' as '500', marginBottom: 2 },
  name: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '400' as '400' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600' as '600', marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  infoText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '400' as '400', marginLeft: SPACING.md, flex: 1 },
  contactButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  contactButton: { flex: 1, marginHorizontal: 4, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactButtonText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '500' as '500', marginTop: SPACING.xs },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '400' as '400', marginTop: SPACING.md },
  bottomPadding: { height: SPACING.xl },
});

export default CardDetailScreen;
