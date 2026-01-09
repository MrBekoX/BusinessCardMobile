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
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { formatPhone, formatName, getInitials, generateRandomColor } from '../../utils/formatters';

// Components
import MemoizedButton from '../../components/common/MemoizedButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CardDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme.colors;
  
  const { card } = route.params;
  const [loading, setLoading] = useState(false);

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

  const getInitialsColor = (name) => {
    const baseColor = generateRandomColor(name);
    return baseColor;
  };

  const renderAvatar = () => {
    if (card.profile_image) {
      return (
        <Image
          source={{ uri: card.profile_image }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      );
    }

    const initials = getInitials(card.company_name || card.name || '');
    const backgroundColor = getInitialsColor(card.company_name || card.name || '');

    return (
      <View style={[styles.avatarFallback, { backgroundColor }]}>
        <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
          {initials}
        </Text>
      </View>
    );
  };

  const handleCall = (phone) => {
    Alert.alert('Arama', `Şu numarayı arayın: ${phone}`);
  };

  const handleEmail = (email) => {
    Alert.alert('E-posta', `Şu adrese e-posta gönderin: ${email}`);
  };

  const handleShare = () => {
    Alert.alert('Paylaş', `${card.company_name} kartvizitini paylaş`);
  };

  const handleEdit = () => {
    Alert.alert('Düzenle', 'Kartvizit düzenleme özelliği yakında eklenecek');
  };

  const handleDelete = () => {
    Alert.alert(
      'Kartviziti Sil',
      'Bu kartviziti silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Silme işlemi
              await new Promise(resolve => setTimeout(resolve, 1000));
              navigation.goBack();
            } catch (error) {
              Alert.alert('Hata', 'Kartvizit silinemedi');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderContactButton = (icon, title, onPress, color) => (
    <TouchableOpacity
      style={[styles.contactButton, { backgroundColor: color + '20' }]}
      onPress={onPress}
    >
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.contactButtonText, { color }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
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
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleEdit}
            >
              <Icon name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleDelete}
              disabled={loading}
            >
              <Icon name="delete" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Preview */}
        <View style={[styles.cardPreview, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            {renderAvatar()}
            <View style={styles.cardInfo}>
              <Text style={[styles.companyName, { color: colors.text }]}>
                {card.company_name}
              </Text>
              <Text style={[styles.position, { color: colors.textSecondary }]}>
                {card.position}
              </Text>
              {card.name && (
                <Text style={[styles.name, { color: colors.textSecondary }]}>
                  {card.name}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            İletişim Bilgileri
          </Text>
          
          {card.email && (
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {card.email}
              </Text>
            </View>
          )}
          
          {card.phone && (
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {formatPhone(card.phone)}
              </Text>
            </View>
          )}
          
          {card.website && (
            <View style={styles.infoRow}>
              <Icon name="language" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {card.website}
              </Text>
            </View>
          )}
          
          {card.address && (
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {card.address}
              </Text>
            </View>
          )}
        </View>

        {/* Social Media */}
        {(card.instagram_url || card.linkedin_url || card.x_url || card.youtube_url) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Sosyal Medya
            </Text>
            
            {card.linkedin_url && (
              <View style={styles.infoRow}>
                <Icon name="link" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  LinkedIn
                </Text>
              </View>
            )}
            
            {card.instagram_url && (
              <View style={styles.infoRow}>
                <Icon name="link" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Instagram
                </Text>
              </View>
            )}
            
            {card.x_url && (
              <View style={styles.infoRow}>
                <Icon name="link" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  X (Twitter)
                </Text>
              </View>
            )}
            
            {card.youtube_url && (
              <View style={styles.infoRow}>
                <Icon name="link" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  YouTube
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Eylemler
          </Text>
          
          <View style={styles.contactButtons}>
            {card.phone && renderContactButton(
              'phone',
              'Ara',
              () => handleCall(card.phone),
              colors.success
            )}
            
            {card.email && renderContactButton(
              'email',
              'E-posta',
              () => handleEmail(card.email),
              colors.primary
            )}
            
            {renderContactButton(
              'share',
              'Paylaş',
              handleShare,
              colors.warning
            )}
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.section}>
          <MemoizedButton
            title="QR Kod Oluştur"
            onPress={() => Alert.alert('QR Kod', 'QR kod oluşturma özelliği yakında eklenecek')}
            variant="outline"
            fullWidth={true}
          />
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  cardPreview: {
    marginHorizontal: -SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  companyName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 2,
  },
  position: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 2,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginLeft: SPACING.md,
    flex: 1,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginTop: SPACING.md,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default CardDetailScreen;